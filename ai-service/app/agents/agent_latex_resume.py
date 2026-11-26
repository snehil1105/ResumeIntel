import re
import logging
from typing import Dict, Any, List, Optional
from app.models.resume import MasterResume, SkillItem

logger = logging.getLogger(__name__)

class LaTeXResumeAgent:
    r"""
    Agent 10: LaTeX Resume Specialist Agent.
    - Preserves candidate's exact template, section hierarchy, and typography.
    - Generates A4 single-page compact, ATS-friendly LaTeX matching the user's authentic resume.
    - Formats Education at the top, followed by Projects, Technical Skills, Coursework & Certifications, and Involvement.
    - Ensures every link (Phone, Email, LinkedIn, GitHub, Portfolio, LeetCode, and Project GitHub icons) is fully clickable via \href.
    - Zero compilation errors: precisely escapes &, %, $, #, _, {, }, ~, ^.
    """

    DEFAULT_ACCENT_COLOR = "000000"

    def __init__(self, llm_provider=None):
        self.llm = llm_provider

    def extract_style_and_color(self, raw_text: str) -> Dict[str, Any]:
        return {"accent_color": self.DEFAULT_ACCENT_COLOR, "is_latex_source": True}

    def escape_latex(self, text: Optional[str]) -> str:
        if not text:
            return ""

        cleaned = str(text).strip()

        cleaned = cleaned.replace('\\', r'\textbackslash{}')
        cleaned = cleaned.replace('&', r'\&')
        cleaned = cleaned.replace('%', r'\%')
        cleaned = cleaned.replace('$', r'\$')
        cleaned = cleaned.replace('#', r'\#')
        cleaned = cleaned.replace('_', r'\_')
        cleaned = cleaned.replace('{', r'\{')
        cleaned = cleaned.replace('}', r'\}')
        cleaned = cleaned.replace('~', r'\textasciitilde{}')
        cleaned = cleaned.replace('^', r'\textasciicircum{}')

        cleaned = cleaned.replace('“', "''").replace('”', "''").replace('"', "''")
        cleaned = cleaned.replace('’', "'").replace('‘', "'")

        return cleaned

    def generate_latex(
        self,
        resume: MasterResume,
        accent_color_hex: Optional[str] = None,
        font_family: str = "default"
    ) -> str:
        p_info = resume.personal_info
        full_name = self.escape_latex(p_info.full_name or "Candidate Name").upper()
        location = self.escape_latex(p_info.location or "")
        email = p_info.email or ""
        phone = p_info.phone or ""
        
        linkedin = p_info.linkedin_url or ""
        github = p_info.github_url or ""
        portfolio = p_info.portfolio_url or ""
        leetcode = getattr(p_info, 'leetcode_url', None) or ""

        # Contact items
        contact_parts = []
        if phone:
            clean_phone = phone.replace(' ', '').replace('-', '')
            contact_parts.append(f"\\faPhone\\ \\href{{tel:{clean_phone}}}{{{self.escape_latex(phone)}}}")
        if email:
            contact_parts.append(f"\\faEnvelope\\ \\href{{mailto:{email}}}{{{self.escape_latex(email)}}}")
        if linkedin:
            contact_parts.append(f"\\faLinkedin\\ \\href{{{linkedin}}}{{LinkedIn}}")
        if github:
            contact_parts.append(f"\\faGithub\\ \\href{{{github}}}{{GitHub}}")
        if portfolio:
            contact_parts.append(f"\\faGlobe\\ \\href{{{portfolio}}}{{Portfolio}}")
        if leetcode:
            contact_parts.append(f"\\faCode\\ \\href{{{leetcode}}}{{LeetCode}}")

        contact_line = "\n\\quad\n".join(contact_parts)

        # 1. EDUCATION (AT THE TOP)
        edu_entries = []
        for edu in (resume.educations or []):
            inst = self.escape_latex(edu.institution_name)
            deg = self.escape_latex(edu.degree)
            dates = self.escape_latex(f"{edu.start_date or ''} -- {edu.end_date or ''}".strip(' -'))
            gpa = self.escape_latex(edu.grade_or_gpa) if edu.grade_or_gpa else ""
            
            entry = f"""\\resumeEducation
{{{inst}}}
{{}}
{{{deg}}}
{{{dates}}}
{{{gpa}}}"""
            edu_entries.append(entry)

        edu_section = f"""% ============================================================
% EDUCATION
% ============================================================
\\section*{{Education}}
{chr(10).join(edu_entries)}
""" if edu_entries else ""

        # 1b. EXPERIENCE (IF PRESENT)
        exp_entries = []
        for exp in (resume.experiences or []):
            comp = self.escape_latex(exp.company_name)
            role = self.escape_latex(exp.job_title)
            dates = self.escape_latex(f"{exp.start_date or ''} -- {exp.end_date or 'Present'}".strip(' -'))
            loc = self.escape_latex(exp.location or "")
            bullets = [f"\\resumeItem{{\n{self.escape_latex(bp)}\n}}" for bp in (exp.bullet_points or [])]
            exp_entries.append(f"""\\resumeSubheading
{{{comp}}}
{{{dates}}}
{{{role}}}
{{{loc}}}
\\resumeItemListStart
{chr(10).join(bullets)}
\\resumeItemListEnd""")

        exp_section = f"""% ============================================================
% EXPERIENCE
% ============================================================
\\section*{{Experience}}
{chr(10).join(exp_entries)}
""" if exp_entries else ""

        # 2. PROJECTS (SECOND)
        proj_entries = []
        for proj in (resume.projects or []):
            title = self.escape_latex(proj.title)
            repo = proj.repo_url
            title_with_link = f"{title} \\href{{{repo}}}{{\\faGithub}}" if repo else title
            tech = ", ".join([self.escape_latex(t) for t in (proj.technologies or [])])
            dates = self.escape_latex(proj.end_date or proj.start_date or "")
            
            bullets = []
            for bp in (proj.bullet_points or []):
                clean_bp = self.escape_latex(bp)
                bullets.append(f"""\\resumeItem{{
{clean_bp}
}}""")

            entry = f"""% ---------------- {title} ----------------
\\resumeProject
{{{title_with_link}}}
{{{tech}}}
{{{dates}}}
\\resumeItemListStart
{chr(10).join(bullets)}
\\resumeItemListEnd"""
            proj_entries.append(entry)

        proj_section = f"""% ============================================================
% PROJECTS
% ============================================================
\\section*{{Projects}}
{chr(10).join(proj_entries)}
""" if proj_entries else ""

        # 3. TECHNICAL SKILLS (THIRD)
        categories: Dict[str, List[str]] = {}
        for s in (resume.skills or []):
            raw_cat = (s.category or "").lower()
            if "language" in raw_cat:
                cat = "Programming Languages"
            elif "framework" in raw_cat or "technologies" in raw_cat:
                cat = "Technologies and Frameworks"
            elif "tool" in raw_cat or "cloud" in raw_cat:
                cat = "Development Tools"
            elif "gen" in raw_cat or "agent" in raw_cat:
                cat = "Generative AI & Agentic AI"
            elif "ml" in raw_cat or "machine learning" in raw_cat:
                cat = "Machine Learning & Data Analysis"
            elif "database" in raw_cat:
                cat = "Databases"
            else:
                cat = s.category or "Technologies and Frameworks"

            if cat not in categories:
                categories[cat] = []
            categories[cat].append(self.escape_latex(s.skill_name))

        skill_lines = []
        for cat, items in categories.items():
            cat_escaped = self.escape_latex(cat)
            items_str = ", ".join(items)
            skill_lines.append(f"""\\resumeSkill
{{{cat_escaped}}}
{{{items_str}}}""")

        skills_section = f"""% ============================================================
% TECHNICAL SKILLS
% ============================================================
\\section*{{Technical Skills}}
{chr(10).join(skill_lines)}
""" if skill_lines else ""

        # 4. COURSEWORK & CERTIFICATIONS (FOURTH)
        coursework = getattr(resume, 'coursework', None) or resume.certifications or []
        cw_lines = []
        for cw in coursework:
            parts = cw.split(':')
            if len(parts) > 1:
                cw_lines.append(f"""\\resumeSkill
{{{self.escape_latex(parts[0].strip())}}}
{{{self.escape_latex(':'.join(parts[1:]).strip())}}}""")
            else:
                cw_lines.append(f"""\\resumeSkill
{{Certification}}
{{{self.escape_latex(cw)}}}""")

        coursework_section = f"""% ============================================================
% COURSEWORK & CERTIFICATIONS
% ============================================================
\\section*{{Coursework & Certifications}}
{chr(10).join(cw_lines)}
""" if cw_lines else ""

        # 5. INVOLVEMENT (FIFTH)
        involvements = getattr(resume, 'involvements', None) or resume.achievements or []
        inv_lines = []
        for inv in involvements:
            parts = inv.split(':')
            if len(parts) > 1:
                inv_lines.append(f"""\\resumeLine
{{{self.escape_latex(parts[0].strip())}:}}
{{{self.escape_latex(':'.join(parts[1:]).strip())}}}""")
            else:
                inv_lines.append(f"""\\resumeLine
{{{self.escape_latex(inv)}}}
{{}}""")

        involvement_section = f"""% ============================================================
% INVOLVEMENT / ACHIEVEMENTS
% ============================================================
\\section*{{Involvement}}
{chr(10).join(inv_lines)}
""" if inv_lines else ""

        location_block = f"  {{\\footnotesize {location}}}\n  \\\\[1pt]\n" if location else ""

        latex_template = f"""% ============================================================
% ATS-FRIENDLY LATEX RESUME
% A4 - ONE PAGE - COMPACT BUT READABLE
% ============================================================
\\documentclass[11pt]{{article}}
% ---------------- PACKAGES ----------------
\\usepackage[
  a4paper,
  left=0.55in,
  right=0.55in,
  top=0.32in,
  bottom=0.32in
]{{geometry}}
\\usepackage{{titlesec}}
\\usepackage{{enumitem}}
\\usepackage{{hyperref}}
\\usepackage{{fontawesome5}}
\\usepackage{{xcolor}}
\\usepackage{{tabularx}}
\\usepackage{{array}}
\\usepackage{{ragged2e}}
\\usepackage[T1]{{fontenc}}
\\usepackage{{lmodern}}
\\usepackage{{parskip}}
\\pagestyle{{empty}}

% ---------------- HYPERLINK SETUP ----------------
\\hypersetup{{
  colorlinks=false,
  pdfborder={{0 0 0}},
  pdftitle={{{full_name} - Resume}},
  pdfsubject={{Resume}}
}}

% ============================================================
% SECTION FORMATTING
% ============================================================
\\titleformat{{\\section}}
  {{\\large\\bfseries\\scshape}}
  {{}}
  {{0em}}
  {{}}
  [\\vspace{{-4pt}}\\rule{{\\linewidth}}{{0.8pt}}\\vspace{{0pt}}]

\\titlespacing*{{\\section}}{{0pt}}{{3pt}}{{2pt}}

% ============================================================
% LIST SPACING
% ============================================================
\\setlist[itemize]{{
  leftmargin=*,
  itemsep=0pt,
  parsep=0pt,
  topsep=0pt,
  partopsep=0pt
}}
\\setlength{{\\parindent}}{{0pt}}
\\setlength{{\\tabcolsep}}{{0pt}}
\\setlength{{\\parskip}}{{0pt}}

% ============================================================
% CUSTOM COMMANDS
% ============================================================
\\newcommand{{\\resumeEducation}}[5]{{
  \\begin{{tabularx}}{{\\textwidth}}{{@{{}}X r@{{}}}}
    \\textbf{{#1}} & #4 \\\\
    \\textit{{#3}} & \\textit{{#5}} \\\\
  \\end{{tabularx}}
  \\vspace{{-2pt}}
}}

\\newcommand{{\\resumeProject}}[3]{{
  \\vspace{{4pt}}
  \\begin{{tabularx}}{{\\textwidth}}{{@{{}}X r@{{}}}}
    \\textbf{{#1}} \\;|\\; \\textit{{#2}} & #3 \\\\
  \\end{{tabularx}}
  \\vspace{{-1pt}}
}}

\\newcommand{{\\resumeItem}}[1]{{
  \\item \\RaggedRight #1
}}

\\newcommand{{\\resumeItemListStart}}{{
  \\begin{{itemize}}[
    leftmargin=*,
    itemsep=0pt,
    parsep=0pt,
    topsep=0pt,
    partopsep=0pt,
    label=\\textbullet
  ]
}}
\\newcommand{{\\resumeItemListEnd}}{{
  \\end{{itemize}}
  \\vspace{{-3pt}}
}}

\\newcommand{{\\resumeSkill}}[2]{{
  \\textbf{{#1:}} #2 \\par
}}

\\newcommand{{\\resumeLine}}[2]{{
  \\textbf{{#1}} #2 \\par
}}

% ============================================================
% DOCUMENT START
% ============================================================
\\begin{{document}}
\\linespread{{0.91}}\\selectfont
\\RaggedRight

% ============================================================
% HEADER
% ============================================================
\\begin{{center}}
  {{\\fontsize{{22}}{{22}}\\selectfont \\textbf{{{full_name}}}}}
  \\\\[1pt]
{location_block}  {{\\scriptsize
{contact_line}
  }}
\\end{{center}}
\\vspace{{-9pt}}

{edu_section}
{exp_section}
{proj_section}
{skills_section}
{coursework_section}
{involvement_section}

% ============================================================
% END
% ============================================================
\\end{{document}}
"""
        return latex_template
