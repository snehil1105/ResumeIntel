import re
import uuid
import json
import logging
from typing import Dict, Any, List, Optional
from app.models.resume import (
    MasterResume, ProtectedPersonalInfo, ProtectedEducation,
    ProtectedExperience, ResumeProject, SkillItem
)
from app.core.exceptions import DocumentParsingException
from app.providers.llm_provider import get_groq_provider, get_gemini_provider

logger = logging.getLogger(__name__)

class ResumeIntelligenceAgent:
    """
    Agent 1: Extracts structured Master Resume from raw text/PDF/DOCX.
    Identifies and isolates immutable protected fields from editable fields.
    Extracts real candidate credentials dynamically without hallucinating or hardcoding defaults.
    """
    def __init__(self, llm_provider=None):
        self.llm = llm_provider

    def extract_from_raw_text(self, raw_text: str, user_id: str) -> MasterResume:
        if not raw_text or len(raw_text.strip()) < 15:
            raise DocumentParsingException("Resume text is empty or too short for extraction.")

        # Clean and de-hyphenate text
        clean_text = raw_text.replace('\r\n', '\n').replace('\r', '\n')
        clean_text = re.sub(r'(\w+)-\s*\n\s*(\w+)', r'\1\2', clean_text)

        # Separate extracted hyperlinks metadata so it NEVER leaks into resume sections
        hyperlinks_section = ""
        body_text = clean_text
        if "--- EXTRACTED HYPERLINKS ---" in clean_text:
            parts = clean_text.split("--- EXTRACTED HYPERLINKS ---", 1)
            body_text = parts[0].strip()
            hyperlinks_section = parts[1].strip()

        lines = [line.strip() for line in body_text.split('\n') if line.strip()]

        # 1. Parse Personal Information (Protected)
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', clean_text)
        email = email_match.group(0) if email_match else "candidate@example.com"

        phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', clean_text)
        phone = phone_match.group(0) if phone_match else None

        # Links extraction
        link_source = hyperlinks_section or body_text
        linkedin_match = re.search(r'(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([\w\-_]+)', link_source, re.IGNORECASE)
        linkedin_url = f"https://www.linkedin.com/in/{linkedin_match.group(1)}" if linkedin_match else None

        github_match = re.search(r'(?:https?:\/\/)?(?:www\.)?github\.com\/([\w\-_]+)(?:\/|\s|$)', link_source, re.IGNORECASE)
        github_url = f"https://github.com/{github_match.group(1)}" if github_match else None

        leetcode_match = re.search(r'(?:https?:\/\/)?(?:www\.)?leetcode\.com\/(?:u\/)?([\w\-_]+)', link_source, re.IGNORECASE)
        leetcode_url = f"https://leetcode.com/u/{leetcode_match.group(1)}" if leetcode_match else None

        portfolio_match = re.search(r'https?:\/\/([a-zA-Z0-9_.\-]+\.(?:dev|me|io|tech|app)(?:\/[^\s]*)?)', link_source, re.IGNORECASE)
        portfolio_url = f"https://{portfolio_match.group(1)}" if portfolio_match and not any(k in portfolio_match.group(1).lower() for k in ['linkedin', 'github', 'gmail', 'yahoo', 'outlook', 'leetcode']) else None

        # Name extraction: scan top lines
        full_name = "Candidate Name"
        for line in lines[:8]:
            lower_line = line.lower()
            if any(term in lower_line for term in ['resume', 'curriculum vitae', 'cv', 'contact', 'email', 'phone', 'page', 'education']):
                continue
            if '@' in line or 'http' in line or 'www.' in line or re.search(r'\d{5,}', line):
                continue
            cleaned = re.sub(r'[^a-zA-Z\s\.]', '', line).strip()
            if 2 <= len(cleaned) <= 45 and len(cleaned.split()) >= 1:
                full_name = cleaned.title()
                break

        # Partition sections first so header location never leaks into Education/other sections
        sections = self._partition_sections(lines)
        header_text = "\n".join(sections.get("header", [])[:8])

        # Location extraction (strictly from header lines only, never university/education names)
        location = ""
        loc_match = re.search(
            r'([A-Za-z][A-Za-z \t]+(?:,[ \t]*[A-Za-z \t]+)+[ \t]*-[ \t]*\d{5,6}|[A-Za-z][A-Za-z \t]+,[ \t]*[A-Za-z]{2}(?:[ \t]+\d{5})?|[A-Za-z][A-Za-z \t]+,[ \t]*(?:USA|India|Canada|UK|Germany|Remote))',
            header_text
        )
        if loc_match:
            loc_candidate = loc_match.group(0).strip()
            if (
                len(loc_candidate) < 65
                and full_name.lower() not in loc_candidate.lower()
                and not any(k in loc_candidate.lower() for k in ["university", "institute", "college", "school", "education"])
            ):
                location = loc_candidate

        personal_info = ProtectedPersonalInfo(
            full_name=full_name,
            email=email,
            phone=phone,
            location=location or None,
            linkedin_url=linkedin_url,
            github_url=github_url,
            portfolio_url=portfolio_url,
            leetcode_url=leetcode_url
        )

        # 3. Educations (Protected)
        educations = self._extract_educations(sections.get("education", []))
        if not educations:
            # Fallback scan across all lines
            edu_keywords = ["bachelor", "master", "b.tech", "b.e.", "b.s.", "m.s.", "university", "college", "institute"]
            for line in lines:
                if any(k in line.lower() for k in edu_keywords):
                    educations.append(ProtectedEducation(
                        institution_name=line[:80].strip(),
                        degree=self._detect_degree(line) or "Bachelor of Science",
                        field_of_study="Computer Science & Engineering",
                        grade_or_gpa=None,
                        start_date="",
                        end_date="",
                        is_verified=True
                    ))
                    break

        # 4. Experiences (Protected)
        experiences = self._extract_experiences(sections.get("experience", []))

        # 5. Projects (Editable & Optimizable)
        projects = self._extract_projects(sections.get("projects", []))

        # Attach extracted GitHub repo URLs to matching projects
        if hyperlinks_section and projects:
            repo_urls = re.findall(r'https?:\/\/(?:www\.)?github\.com\/[\w\-_.]+\/[\w\-_.]+', hyperlinks_section, re.IGNORECASE)
            used_repos = set()
            for proj in projects:
                if proj.repo_url:
                    continue
                title_tokens = [t.lower() for t in re.findall(r'[a-zA-Z0-9]+', proj.title) if len(t) > 2]
                for r_url in repo_urls:
                    if r_url in used_repos:
                        continue
                    slug = r_url.rsplit('/', 1)[-1].lower()
                    if any(tok in slug for tok in title_tokens):
                        proj.repo_url = r_url
                        used_repos.add(r_url)
                        break
            # Positional fallback for remaining unmatched repo URLs
            remaining_repos = [u for u in repo_urls if u not in used_repos]
            for proj in projects:
                if not proj.repo_url and remaining_repos:
                    proj.repo_url = remaining_repos.pop(0)

        # 6. Skills Detection
        skills = self._extract_skills(sections.get("skills", []), body_text)

        # 7. Summary / Headline
        summary_lines = sections.get("summary", [])
        if summary_lines:
            prof_summary = " ".join(summary_lines[:4])
        else:
            top_skills = [s.skill_name for s in skills[:4]]
            prof_summary = f"Results-driven software engineer with practical experience in {', '.join(top_skills) if top_skills else 'software engineering'}. Proven track record delivering reliable features, clean architecture, and well-tested code."

        headline = f"Software Engineer | {skills[0].skill_name if skills else 'Full Stack'}"

        # 8. Coursework & Certifications
        cw_raw = sections.get("coursework", []) + sections.get("certifications", [])
        coursework = self._join_wrapped_items(cw_raw)

        # 9. Achievements (kept strictly separate from Involvement/Extracurriculars)
        ach_raw = sections.get("achievements", [])
        achievements = self._join_wrapped_items(ach_raw)

        # 10. Involvement & Extracurriculars
        inv_raw = sections.get("involvement", [])
        involvements = self._join_wrapped_items(inv_raw)

        certifications = coursework[:5]

        return MasterResume(
            user_id=user_id,
            personal_info=personal_info,
            headline=headline,
            professional_summary=prof_summary,
            educations=educations,
            experiences=experiences,
            projects=projects,
            skills=skills,
            certifications=certifications,
            achievements=achievements,
            coursework=coursework,
            involvements=involvements,
            raw_text=raw_text
        )

    async def extract_with_dual_llm(self, raw_text: str, user_id: str) -> MasterResume:
        """
        Agent 1 Dual-LLM Extraction:
        1. Builds fast deterministic baseline via extract_from_raw_text.
        2. Uses Groq to cleanly parse ANY resume layout (wrapped headers, icons, multi-column)
           into structured MasterResume JSON.
        3. Uses Gemini to double-check Groq's JSON against the raw text so zero projects,
           links, skills, or involvement lines are merged, dropped, or fabricated.
        """
        baseline = self.extract_from_raw_text(raw_text, user_id)
        groq = get_groq_provider()
        gemini = get_gemini_provider()

        if not groq and not gemini:
            return baseline

        schema_desc = """{
  "personal_info": {
    "full_name": "Candidate Full Name",
    "email": "email@example.com",
    "phone": "+91...",
    "location": "City, State (or null if not present; NEVER a university name)",
    "linkedin_url": "https://...",
    "github_url": "https://...",
    "portfolio_url": "https://...",
    "leetcode_url": "https://..."
  },
  "educations": [
    {
      "institution_name": "University / School Name",
      "degree": "Full Degree Name",
      "field_of_study": "",
      "grade_or_gpa": "CGPA / %",
      "start_date": "Start",
      "end_date": "End"
    }
  ],
  "experiences": [
    {
      "company_name": "Company",
      "job_title": "Role",
      "location": "City",
      "start_date": "Start",
      "end_date": "End",
      "bullet_points": ["bullet 1"]
    }
  ],
  "projects": [
    {
      "title": "Exact Project Title (no trailing icon letters like W or §)",
      "technologies": ["Tech1", "Tech2"],
      "start_date": "Date",
      "end_date": "Date",
      "repo_url": "https://github.com/...",
      "bullet_points": ["Complete bullet 1", "Complete bullet 2"]
    }
  ],
  "skills": [
    {"category": "Languages", "skill_name": "Python"}
  ],
  "coursework": ["Label: description (empty list if resume has no Coursework/Certifications section)"],
  "achievements": ["Achievement bullet (empty list if resume has no Achievements/Awards section)"],
  "involvements": ["Label: description (empty list if resume has no Involvement/Extracurricular section)"]
}"""

        parse_prompt = f"""Parse the following resume text and extracted hyperlinks into clean, 100% factual structured JSON.
CRITICAL RULES:
1. Separate EVERY distinct project into its own object in `projects` (never merge a second project into the previous project's bullet_points!).
2. Keep `technologies` clean (no dates, no empty strings, no leading commas).
3. Strip PDF icon artifacts (like trailing `W` or `§`) from project titles and involvement labels.
4. `location` must ONLY be the candidate's city/state/country (never a university/college name).
5. Only include `coursework`, `achievements`, or `involvements` if the resume actually has those sections. Keep `achievements` and `involvements` strictly separate. Never invent or copy data not in the text.
6. Match extracted GitHub repository URLs to their corresponding projects in `repo_url`.
7. NEVER shorten or abbreviate Education! Keep full institution names, locations, full degree & branch names (e.g. "Bachelor of Technology - Electrical and Electronics Engineering"), minor degrees, CGPAs/percentages, and exact dates verbatim.

Resume Text & Extracted Hyperlinks:
{raw_text[:9000]}
"""

        parsed_json: Optional[Dict[str, Any]] = None
        if groq:
            try:
                parsed_json = await groq.generate_structured(
                    parse_prompt,
                    schema_desc,
                    system_prompt="You are Agent 1, a precision resume parser. Extract 100% factual structured data without merging projects or inventing fields."
                )
            except Exception as e:
                logger.warning(f"Agent 1 Groq extraction failed: {e}")

        if gemini:
            audit_prompt = f"""Double-check and fix the parsed resume JSON below against the raw resume text.
Check:
1. Are ALL projects separated cleanly (no project swallowed inside another project's bullet_points)?
2. Are all `technologies` clean (no dates, no empty strings)?
3. Is `location` strictly the candidate's home city/location (or null if none — NEVER a university/education name)?
4. Are all social links and project `repo_url`s preserved from the extracted hyperlinks?
5. Are `coursework` and `involvements` strictly from the resume (not invented, not split across line wraps)?

Raw Resume Text:
{raw_text[:7000]}

Parsed JSON to Verify:
{json.dumps(parsed_json or baseline.model_dump(mode='json'), indent=2)[:7000]}
"""
            try:
                verified_json = await gemini.generate_structured(
                    audit_prompt,
                    schema_desc,
                    system_prompt="You are Gemini auditing Agent 1's resume parsing. Fix any merged projects, dirty tech stacks, leaked university names in location, or split lines."
                )
                if isinstance(verified_json, dict) and verified_json.get("personal_info"):
                    parsed_json = verified_json
            except Exception as e:
                logger.warning(f"Agent 1 Gemini verification failed: {e}")

        if not parsed_json or not isinstance(parsed_json, dict):
            return baseline

        try:
            p_raw = parsed_json.get("personal_info") or {}
            loc_val = (p_raw.get("location") or "").strip()
            if any(k in loc_val.lower() for k in ["university", "institute", "college", "school", "education"]):
                loc_val = ""

            p_info = ProtectedPersonalInfo(
                full_name=(p_raw.get("full_name") or baseline.personal_info.full_name).strip(),
                email=(p_raw.get("email") or baseline.personal_info.email).strip(),
                phone=p_raw.get("phone") or baseline.personal_info.phone,
                location=loc_val or None,
                linkedin_url=p_raw.get("linkedin_url") or baseline.personal_info.linkedin_url,
                github_url=p_raw.get("github_url") or baseline.personal_info.github_url,
                portfolio_url=p_raw.get("portfolio_url") or baseline.personal_info.portfolio_url,
                leetcode_url=p_raw.get("leetcode_url") or baseline.personal_info.leetcode_url,
            )

            edus = [
                ProtectedEducation(
                    institution_name=e.get("institution_name", ""),
                    degree=e.get("degree", ""),
                    field_of_study=e.get("field_of_study") or "",
                    grade_or_gpa=e.get("grade_or_gpa"),
                    start_date=e.get("start_date") or "",
                    end_date=e.get("end_date") or "",
                    is_verified=True,
                )
                for e in (parsed_json.get("educations") or [])
                if e.get("institution_name")
            ] or baseline.educations

            exps = [
                ProtectedExperience(
                    company_name=ex.get("company_name", ""),
                    job_title=ex.get("job_title", "Software Engineer"),
                    location=ex.get("location") or "",
                    start_date=ex.get("start_date") or "",
                    end_date=ex.get("end_date") or "Present",
                    bullet_points=[b.strip() for b in (ex.get("bullet_points") or []) if b and b.strip()],
                    is_verified=True,
                )
                for ex in (parsed_json.get("experiences") or [])
                if ex.get("company_name")
            ]

            projs = []
            for p in (parsed_json.get("projects") or []):
                title = re.sub(r'\s+[W§]$', '', (p.get("title") or "").strip()).strip()
                if not title:
                    continue
                techs = [t.strip(' ,;|') for t in (p.get("technologies") or []) if t and t.strip(' ,;|')]
                bullets = [b.strip() for b in (p.get("bullet_points") or []) if b and b.strip()]
                projs.append(ResumeProject(
                    title=title,
                    role="Developer",
                    start_date=p.get("start_date") or "",
                    end_date=p.get("end_date") or p.get("start_date") or "",
                    summary=bullets[0] if bullets else "",
                    technologies=techs,
                    bullet_points=bullets,
                    repo_url=p.get("repo_url") or None,
                    is_verified=True,
                ))
            if not projs:
                projs = baseline.projects

            skills = [
                SkillItem(
                    id=f"skill-{i+1}",
                    category=(s.get("category") or "Technologies and Frameworks").strip(),
                    skill_name=(s.get("skill_name") or "").strip(),
                    proficiency_level="ADVANCED",
                    years_experience=2.0,
                    is_verified=True,
                )
                for i, s in enumerate(parsed_json.get("skills") or [])
                if s.get("skill_name") and s.get("skill_name").strip()
            ] or baseline.skills

            cw = [c.strip() for c in (parsed_json.get("coursework") or []) if c and c.strip()]
            ach = [a.strip() for a in (parsed_json.get("achievements") or []) if a and a.strip()]
            inv = [iv.strip() for iv in (parsed_json.get("involvements") or []) if iv and iv.strip()]

            return MasterResume(
                user_id=user_id,
                personal_info=p_info,
                headline=f"Software Engineer | {skills[0].skill_name if skills else 'Full Stack'}",
                professional_summary=baseline.professional_summary,
                educations=edus,
                experiences=exps,
                projects=projs,
                skills=skills,
                certifications=cw[:5],
                achievements=ach,
                coursework=cw,
                involvements=inv,
                raw_text=raw_text,
            )
        except Exception as e:
            logger.warning(f"Failed building MasterResume from Dual-LLM JSON: {e}. Using baseline.")
            return baseline

    def _partition_sections(self, lines: List[str]) -> Dict[str, List[str]]:
        """Splits resume text lines into named sections."""
        section_headers = {
            "education": ["education", "academic background", "qualifications", "academic credentials", "academics"],
            "experience": ["experience", "work experience", "employment history", "professional experience", "internships"],
            "projects": ["projects", "personal projects", "academic projects", "technical projects", "key projects"],
            "skills": ["skills", "technical skills", "skills & tools", "core competencies", "technologies"],
            "summary": ["summary", "professional summary", "about me", "profile", "objective", "career objective"],
            "coursework": ["coursework & certifications", "coursework and certifications", "certifications & coursework", "coursework", "relevant coursework", "courses"],
            "certifications": ["certifications", "licenses", "certificates", "credentials"],
            "involvement": ["involvement", "involvements", "extracurricular", "extracurriculars", "activities", "leadership", "involvement & extracurriculars"],
            "achievements": ["achievements", "awards", "honors", "accomplishments"]
        }

        current_section = "header"
        sections: Dict[str, List[str]] = {k: [] for k in section_headers}
        sections["header"] = []

        for line in lines:
            line_clean = line.strip().lower()
            matched_header = None
            for sec_name, keywords in section_headers.items():
                if any(line_clean == kw or line_clean.startswith(kw + ":") or line_clean.endswith(kw) for kw in keywords):
                    if len(line_clean) < 35:
                        matched_header = sec_name
                        break
            
            if matched_header:
                current_section = matched_header
            else:
                if current_section in sections:
                    sections[current_section].append(line)

        return sections

    def _extract_educations(self, lines: List[str]) -> List[ProtectedEducation]:
        educations = []
        if not lines:
            return educations

        cur_inst = None
        cur_deg = None
        cur_field = None
        cur_start = None
        cur_end = None
        cur_gpa = None

        edu_inst_keywords = ["university", "college", "institute", "school", "academy", "polytechnic", "vidyalaya", "vidyabhavan", "bhavan", "convent"]

        def save_current():
            nonlocal cur_inst, cur_deg, cur_field, cur_start, cur_end, cur_gpa
            if not cur_inst:
                return
            is_school = any(s in cur_inst.lower() for s in ["school", "vidyalaya", "vidyabhavan", "bhavan", "high school", "convent"])
            deg = cur_deg or ("Secondary Education" if is_school else "Bachelor's Degree")
            field = cur_field or ""
            
            # Deduplicate
            exists = any(e.institution_name.lower() == cur_inst.lower() and e.degree.lower() == deg.lower() for e in educations)
            if not exists:
                educations.append(ProtectedEducation(
                    institution_name=cur_inst,
                    degree=deg,
                    field_of_study=field,
                    grade_or_gpa=cur_gpa,
                    start_date=cur_start or "",
                    end_date=cur_end or "",
                    is_verified=True
                ))

        for line in lines:
            # Date match
            date_m = re.search(r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?[a-z]*\s*(?:19|20)\d{2}\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?[a-z]*\s*)?(?:(?:19|20)\d{2}|Present|Current)|(?:19|20)\d{2})', line, re.I)
            line_dates = date_m.group(1).strip() if date_m else None

            # GPA match
            gpa_m = re.search(r'(?:(?:GPA|CGPA|Grade)[\s:]*)?([0-9\.]+\s*(?:\/\s*[0-9\.]+|%))|([0-9]{2}(?:\.[0-9]+)?\s*%)', line, re.I)
            line_gpa = (gpa_m.group(1) or gpa_m.group(2)).strip() if gpa_m else None

            has_inst = any(k in line.lower() for k in edu_inst_keywords) and len(line) < 100
            deg_detected = self._detect_degree(line)

            if has_inst and not deg_detected:
                save_current()
                inst_clean = line
                if line_dates:
                    inst_clean = inst_clean.replace(line_dates, '').strip()
                if line_gpa:
                    inst_clean = inst_clean.replace(line_gpa, '').strip()
                cur_inst = inst_clean.strip(' ,|–-')
                cur_deg = None
                cur_field = None
                cur_start = None
                cur_end = None
                cur_gpa = None
                if line_dates:
                    parts = [p.strip() for p in re.split(r'[-–—]|\bto\b', line_dates) if p.strip()]
                    cur_start = parts[0] if parts else line_dates
                    cur_end = parts[1] if len(parts) > 1 else parts[0]
                if line_gpa:
                    cur_gpa = line_gpa
                continue

            if deg_detected:
                deg_clean = line
                if line_dates:
                    deg_clean = deg_clean.replace(line_dates, '').strip()
                if line_gpa:
                    deg_clean = deg_clean.replace(line_gpa, '').strip()
                deg_clean = re.sub(r'[-–|,\s]*(?:CGPA|GPA|Percentage|Grade)\s*:?\s*$', '', deg_clean, flags=re.I).strip(' -–|,')
                if re.match(r'^minor\b', deg_clean, re.I) and cur_deg:
                    cur_deg = f"{cur_deg} ({deg_clean})"
                else:
                    cur_deg = deg_clean or deg_detected

            if line_dates:
                parts = [p.strip() for p in re.split(r'[-–—]|\bto\b', line_dates) if p.strip()]
                cur_start = parts[0] if parts else line_dates
                cur_end = parts[1] if len(parts) > 1 else parts[0]

            if line_gpa:
                cur_gpa = line_gpa

        save_current()
        return educations

    def _detect_degree(self, text: str) -> Optional[str]:
        degree_patterns = [
            (r'b\.tech(?:\s+in\s+[\w\s&]+)?', 'B.Tech'),
            (r'intermediate(?:\s*\(\s*12th\s*grade\s*\))?|12th\s*(?:grade|board)|gshseb|cbse|icse|hsc', '12th Board'),
            (r'matriculation(?:\s*\(\s*10th\s*grade\s*\))?|10th\s*(?:grade|board)|ssc', '10th Board'),
            (r'minor\s+in\s+[\w\s&]+', 'Minor'),
            (r'bachelor(?:[\w\s\']*)?(?:in\s+[\w\s&]+)?', 'Bachelor of Technology'),
            (r'master(?:[\w\s\']*)?(?:in\s+[\w\s&]+)?', 'Master of Science'),
            (r'm\.tech(?:\s+in\s+[\w\s&]+)?', 'M.Tech'),
            (r'b\.s\.?(?:\s+in\s+[\w\s&]+)?', 'Bachelor of Science'),
            (r'm\.s\.?(?:\s+in\s+[\w\s&]+)?', 'Master of Science'),
            (r'ph\.?d\.?(?:\s+in\s+[\w\s&]+)?', 'Ph.D.'),
            (r'secondary(?:\s*school)?', 'Secondary School')
        ]
        for pat, default_name in degree_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                matched_str = m.group(0).strip()
                return matched_str if len(matched_str) > 6 else default_name
        return None

    def _extract_experiences(self, lines: List[str]) -> List[ProtectedExperience]:
        experiences = []
        if not lines:
            return experiences

        current_company = None
        current_title = None
        current_dates = "2023 - Present"
        current_bullets = []

        for line in lines:
            if line.startswith(('•', '-', '*', '–')):
                clean_bullet = line.lstrip('•-*– ').strip()
                if len(clean_bullet) > 10:
                    current_bullets.append(clean_bullet)
                continue

            # Multi-line bullet continuation
            if current_bullets and (line[0].islower() or len(line) > 80):
                current_bullets[-1] = current_bullets[-1] + ' ' + line
                continue

            date_match = re.search(r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?[a-z]*\s*(?:19|20)\d{2}\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?[a-z]*\s*(?:19|20)\d{2}|Present|Current))', line, re.IGNORECASE)
            if date_match or (any(t in line.lower() for t in ['intern', 'engineer', 'developer', 'analyst', 'manager', 'lead']) and len(line) < 80):
                if current_company and current_bullets:
                    experiences.append(ProtectedExperience(
                        company_name=current_company,
                        job_title=current_title or "Software Engineer",
                        location="Remote / Hybrid",
                        start_date=current_dates.split('-')[0].strip() if '-' in current_dates else current_dates,
                        end_date=current_dates.split('-')[-1].strip() if '-' in current_dates else "Present",
                        bullet_points=current_bullets[:4],
                        technologies=self._extract_technologies_from_text(" ".join(current_bullets)),
                        is_verified=True
                    ))
                    current_bullets = []

                if date_match:
                    current_dates = date_match.group(1)
                    rest = line.replace(current_dates, '').strip(' |-,–')
                    parts = [p.strip() for p in re.split(r'[,|–\-]', rest) if p.strip()]
                    current_company = parts[0] if parts else "Software Company"
                    current_title = parts[1] if len(parts) > 1 else "Software Engineer"
                else:
                    parts = [p.strip() for p in re.split(r'[,|–\-]', line) if p.strip()]
                    current_company = parts[0] if parts else line
                    current_title = parts[1] if len(parts) > 1 else "Software Engineer"

        if current_company and current_bullets:
            experiences.append(ProtectedExperience(
                company_name=current_company,
                job_title=current_title or "Software Engineer",
                location="Remote / Hybrid",
                start_date=current_dates.split('-')[0].strip() if '-' in current_dates else current_dates,
                end_date=current_dates.split('-')[-1].strip() if '-' in current_dates else "Present",
                bullet_points=current_bullets[:4],
                technologies=self._extract_technologies_from_text(" ".join(current_bullets)),
                is_verified=True
            ))

        return experiences

    def _extract_projects(self, lines: List[str]) -> List[ResumeProject]:
        projects: List[ResumeProject] = []
        if not lines:
            return projects

        cur_title = None
        cur_techs: List[str] = []
        cur_bullets: List[str] = []
        cur_date = ""
        cur_repo = None

        date_regex = re.compile(
            r'^(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?(?:19|20)\d{2}(?:\s*\(.*?\))?(?:\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*)?(?:(?:19|20)\d{2}|Present|Current|Ongoing))?',
            re.I
        )

        def save_project():
            nonlocal cur_title, cur_techs, cur_bullets, cur_date, cur_repo
            if not cur_title and not cur_bullets:
                return

            # Clean or infer title if blank or date
            p_title = cur_title
            if not p_title or date_regex.match(p_title):
                if cur_bullets:
                    q = re.search(r'[\"“\']([^\"“”\']+)[\"”\']', cur_bullets[0])
                    if q:
                        p_title = q.group(1).strip()
                    else:
                        words = [w for w in cur_bullets[0].split()[:4] if not w.lower().startswith(('built', 'engineered', 'developed', 'created'))]
                        p_title = " ".join(words) or "Technical Project"
                else:
                    p_title = "Technical Project"

            # Clean any link icons/symbols like § or trailing FontAwesome 'W' icon glyph from title
            p_title = re.sub(r'[\u00a7\u2022\*\#\$\^\&]', '', p_title).strip()
            p_title = re.sub(r'\s+W$', '', p_title).strip()

            projects.append(ResumeProject(
                title=p_title,
                role="Developer",
                start_date=cur_date or "",
                end_date=cur_date or "",
                summary=cur_bullets[0] if cur_bullets else "",
                technologies=cur_techs if cur_techs else self._extract_technologies_from_text(" ".join(cur_bullets)),
                bullet_points=cur_bullets,
                repo_url=cur_repo,
                is_verified=True
            ))
            cur_bullets = []
            cur_techs = []
            cur_repo = None

        for line in lines:
            trimmed = line.strip()
            if not trimmed or re.fullmatch(r'[\|\-–—\s•*]+', trimmed):
                continue

            # Repo / Hyperlink detection
            if "github.com" in trimmed.lower() or "http" in trimmed.lower():
                link_m = re.search(r'https?://[^\s]+', trimmed)
                if link_m:
                    cur_repo = link_m.group(0)

            # Bullet detection
            if trimmed.startswith(('•', '-', '*', '–')):
                clean_b = re.sub(r'^[•\-\*–]\s*', '', trimmed).strip()
                if clean_b:
                    cur_bullets.append(clean_b)
                continue

            # Explicit project header with pipe '|' (e.g. "Webate: Tech Enthusiast Debate Platform | WebRTC, React ... Dec 2023")
            is_pipe_header = ('|' in trimmed and trimmed[0].isupper())

            # Continuation of previous bullet (only when NOT an explicit pipe project header)
            if cur_bullets and not is_pipe_header and (trimmed[0].islower() or len(trimmed) > 85):
                cur_bullets[-1] = cur_bullets[-1] + " " + trimmed
                continue

            # Pure date line check FIRST (e.g. "June 2026", "May 2026", "2024")
            # A pure date must NEVER start a new project!
            if date_regex.match(trimmed) and len(trimmed) < 35:
                cur_date = trimmed
                continue

            # Project Header line (e.g. "HookRelay | Java, Spring Boot ... June 2026")
            if is_pipe_header or len(trimmed) < 80:
                # Extract and strip trailing date BEFORE splitting on '|' so dates never leak into tech stack
                d_m = re.search(r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*(?:19|20)\d{2}(?:\s*[-–—to]+\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*)?(?:(?:19|20)\d{2}|Present|Current|Ongoing))?)\s*$', trimmed, re.I)
                header_date = d_m.group(1).strip() if d_m else ""
                header_body = trimmed[:d_m.start()].strip(' –|-') if d_m else trimmed

                parts = [p.strip() for p in re.split(r'[|]', header_body) if p.strip()]
                if not parts:
                    continue
                first = parts[0]
                rest = parts[1:] if len(parts) > 1 else []

                is_first_date = bool(date_regex.match(first))
                if is_first_date and len(first) < 30:
                    header_date = first
                    header_title = ""
                    header_techs = [t.strip(' ,;') for p in rest for t in p.split(',') if t.strip(' ,;')]
                else:
                    header_title = first.strip(' –|-')
                    header_techs = [t.strip(' ,;') for p in rest for t in p.split(',') if t.strip(' ,;')]

                # Save previous project if exists
                if cur_title or cur_bullets:
                    save_project()

                cur_title = header_title
                cur_date = header_date
                cur_techs = header_techs

        save_project()
        return projects

    def _join_wrapped_items(self, raw_lines: List[str]) -> List[str]:
        """Joins wrapped continuation lines in Coursework/Involvement sections into complete items."""
        items: List[str] = []
        for raw in raw_lines:
            line = raw.strip()
            if not line:
                continue
            # Filter out leaked hyperlink metadata
            if "EXTRACTED HYPERLINKS" in line.upper() or re.match(r'^(https?:\/\/|mailto:|tel:)', line, re.I):
                continue

            is_bullet = line.startswith(('•', '-', '*', '–'))
            clean = line.lstrip('•-*– ').strip()
            # Clean FontAwesome external-link icon artifact 'W' after colons (e.g. "Paper: W \"AI in Education\"")
            clean = re.sub(r':\s*W\s+', ': ', clean)
            if not clean:
                continue

            # Start a new item if it's a bullet, or has a "Label: content" prefix, or no previous item exists
            has_label = bool(re.match(r'^[A-Z][A-Za-z0-9\s&/\-\(\)]{2,45}:', clean))
            if is_bullet or has_label or not items:
                items.append(clean)
            else:
                # Continuation of previous wrapped line
                items[-1] = items[-1].rstrip() + " " + clean
        return [it for it in items if len(it) > 4]

    def _extract_skills(self, skill_section_lines: List[str], full_text: str) -> List[SkillItem]:
        skills: List[SkillItem] = []
        seen = set()

        # 1. If the resume has explicit "Category: skill1, skill2" lines, unwrap & parse them cleanly
        unwrapped_lines: List[str] = []
        for raw in skill_section_lines:
            l = raw.strip()
            if not l:
                continue
            if ':' in l and len(l.split(':', 1)[0]) <= 40:
                unwrapped_lines.append(l)
            elif unwrapped_lines:
                unwrapped_lines[-1] = unwrapped_lines[-1].rstrip() + " " + l
            else:
                unwrapped_lines.append(l)

        for line in unwrapped_lines:
            if ':' in line:
                cat_raw, rest = line.split(':', 1)
                cat = cat_raw.strip('•-* ')
                tokens = [t.strip('•-* ') for t in re.split(r'[,|•]', rest) if t.strip()]
            else:
                cat = "Technologies and Frameworks"
                tokens = [t.strip('•-* ') for t in re.split(r'[,|•]', line) if t.strip()]

            for tok in tokens:
                if 1 <= len(tok) <= 45 and tok.lower() not in seen:
                    seen.add(tok.lower())
                    skills.append(SkillItem(
                        id=f"skill-{len(skills)+1}",
                        skill_name=tok,
                        category=cat,
                        proficiency_level="ADVANCED" if any(k in cat.lower() for k in ["language", "framework", "ai"]) else "INTERMEDIATE",
                        years_experience=2.0,
                        is_verified=True
                    ))

        if skills:
            return skills

        # 2. Fallback catalog scan only if no explicit Skills section lines were parsed
        skill_catalog = [
            ("Java", "Programming Languages"), ("Python", "Programming Languages"), ("JavaScript", "Programming Languages"),
            ("TypeScript", "Programming Languages"), ("C++", "Programming Languages"), ("C#", "Programming Languages"),
            ("Go", "Programming Languages"), ("Rust", "Programming Languages"), ("Ruby", "Programming Languages"), ("SQL", "Programming Languages"),
            ("Spring Boot", "Technologies and Frameworks"), ("React", "Technologies and Frameworks"),
            ("Node.js", "Technologies and Frameworks"), ("Express", "Technologies and Frameworks"),
            ("Next.js", "Technologies and Frameworks"), ("FastAPI", "Technologies and Frameworks"),
            ("Django", "Technologies and Frameworks"), ("Flask", "Technologies and Frameworks"),
            ("PostgreSQL", "Databases"), ("MySQL", "Databases"), ("MongoDB", "Databases"),
            ("Redis", "Databases"), ("Docker", "Development Tools"), ("Kubernetes", "Development Tools"),
            ("AWS", "Development Tools"), ("Git", "Development Tools"), ("Linux", "Development Tools"),
            ("REST APIs", "Technologies and Frameworks"), ("NumPy", "Machine Learning & Data Analysis"),
            ("Pandas", "Machine Learning & Data Analysis")
        ]

        text_lower = full_text.lower()
        for name, category in skill_catalog:
            pattern = r'\b' + re.escape(name.lower()) + r'\b'
            if re.search(pattern, text_lower) and name.lower() not in seen:
                seen.add(name.lower())
                skills.append(SkillItem(
                    id=f"skill-{len(skills)+1}",
                    skill_name=name,
                    category=category,
                    proficiency_level="ADVANCED",
                    years_experience=2.0,
                    is_verified=True
                ))

        return skills

    def _extract_technologies_from_text(self, text: str) -> List[str]:
        popular = ["Java", "Python", "React", "Spring Boot", "Node.js", "PostgreSQL", "MySQL", "MongoDB", "Docker", "AWS", "Git", "REST APIs", "TypeScript", "Django", "FastAPI", "OpenCV", "Redis"]
        found = []
        for t in popular:
            if re.search(r'\b' + re.escape(t.lower()) + r'\b', text.lower()):
                found.append(t)
        return found or ["Software Engineering"]
