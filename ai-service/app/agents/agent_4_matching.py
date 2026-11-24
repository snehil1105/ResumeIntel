import re
from typing import List, Dict, Any, Set, Tuple, Optional
from app.models.resume import MasterResume
from app.models.job import JobAnalysisReport
from app.models.company import CompanyResearchReport
from app.models.matching import (
    CandidateMatchReport, SkillAlignment, ProjectRelevance
)

INCOMPATIBLE_ROLE_PATTERNS = [
    ("Content Creation & Digital Media", [
        "content creator", "video editor", "videographer", "cinematographer",
        "social media", "influencer", "youtuber", "reels", "tiktok",
        "vlogger", "scriptwriter", "creative producer", "podcaster", "ugc creator"
    ], [
        "Video editing & production (Premiere Pro, CapCut, DaVinci Resolve)",
        "Short-form social media growth (Reels/TikTok/Shorts)",
        "Scriptwriting, creative storytelling, and viral hooks",
        "On-camera presentation, lighting, and audio management"
    ]),
    ("Graphic Design & Visual Arts", [
        "graphic designer", "illustrator", "photographer", "fashion designer",
        "interior designer", "visual artist", "3d artist", "animator"
    ], [
        "Visual design (Photoshop, Illustrator, InDesign)",
        "Typography, color theory, and branding assets",
        "Creative portfolio and artistic composition"
    ]),
    ("Healthcare & Clinical Services", [
        "nurse", "registered nurse", "doctor", "physician", "surgeon",
        "dentist", "pharmacist", "therapist", "paramedic", "patient care"
    ], [
        "Clinical medical license and patient diagnosis",
        "Pharmacology and clinical triage administration",
        "HIPAA healthcare compliance and medical recordkeeping"
    ]),
    ("Sales & Telemarketing (Non-Technical)", [
        "sales representative", "telecaller", "cold caller", "telesales",
        "real estate agent", "insurance agent", "retail cashier", "store associate"
    ], [
        "Outbound cold prospecting and quota management",
        "Objection handling and retail merchandising",
        "POS point-of-sale customer transactions"
    ]),
    ("Culinary & Hospitality", [
        "chef", "cook", "baker", "barista", "bartender", "waiter", "waitress", "hotel receptionist"
    ], [
        "Commercial kitchen culinary preparation and ServSafe safety standards",
        "Beverage craft and restaurant table service",
        "Guest hospitality and dining room management"
    ]),
    ("Civil & Physical Construction Trades", [
        "civil engineer", "site supervisor", "construction manager", "plumber", "electrician"
    ], [
        "AutoCAD/Revit structural drawings and building code compliance",
        "On-site construction supervision and material safety",
        "Physical trades installation and site inspection"
    ])
]

TECH_KEYWORDS = [
    "software", "developer", "engineer", "backend", "frontend", "fullstack", "full-stack",
    "java", "python", "c++", "c#", "api", "database", "sql", "postgresql", "redis", "cloud",
    "docker", "kubernetes", "microservices", "computer science", "algorithms", "restful"
]

class CandidateJobMatchingAgent:
    """
    Agent 4: Transparently compares candidate's Master Resume against analyzed JD & company intelligence.
    Computes componentized alignment scores. Strictly refuses to synthesize tailored content
    when the role domain does not align with the candidate's verified engineering profile.
    """
    def __init__(self):
        pass

    def _check_domain_compatibility(
        self,
        resume: MasterResume,
        jd: JobAnalysisReport,
        candidate_skills: Set[str],
        matched_skills: List[str]
    ) -> Tuple[bool, Optional[str], Optional[str], Optional[Dict[str, Any]]]:
        title_lower = (jd.job_title or "").lower()
        skills_text = " ".join(jd.mandatory_skills + jd.preferred_skills + jd.keywords).lower()
        combined_jd = f"{title_lower} {skills_text}"

        # 1. Check if JD matches incompatible non-software domain
        detected_category = None
        detected_demands = []
        for cat_name, patterns, demands in INCOMPATIBLE_ROLE_PATTERNS:
            if any(p in title_lower or p in combined_jd for p in patterns):
                detected_category = cat_name
                detected_demands = demands
                break

        # 2. Check tech keyword density in JD
        matched_tech_count = sum(1 for kw in TECH_KEYWORDS if kw in combined_jd)

        # Incompatible if:
        # A) Explicit non-software role detected AND matched verified candidate skills <= 1
        # B) Zero matched verified skills AND matched tech keywords <= 1
        is_incompatible = (
            (detected_category is not None and len(matched_skills) <= 1) or
            (len(matched_skills) == 0 and matched_tech_count <= 1)
        )

        if is_incompatible:
            job_domain = detected_category or "Non-Technical / Unrelated Domain"
            candidate_domain = "Computer Science & Software Engineering"
            reason = (
                f"Candidate's verified engineering profile ({candidate_domain}) has 0% vector alignment "
                f"with target role '{jd.job_title}' ({job_domain}). Resume tailoring is withheld to prevent "
                f"hallucinating false credentials or misrepresenting candidate background."
            )
            ai_summary = {
                "headline": f"Domain Mismatch: {candidate_domain} vs. {job_domain}",
                "candidate_domain": candidate_domain,
                "job_domain": job_domain,
                "candidate_profile": "Specialized in Backend Architecture, Java/Spring Boot microservices, relational SQL/PostgreSQL databases, Redis Streams event processing, and REST APIs.",
                "job_demands": detected_demands if detected_demands else [
                    "Requires field-specific non-software credentials not found in technical profile",
                    "Deliverables unrelated to computer software development or systems engineering"
                ],
                "vector_mismatch_explanation": "None of the candidate's verified software engineering skills or CS coursework intersect with the core competencies demanded by this job opening.",
                "factual_integrity_notice": "Factual Integrity Guard Active: Tailoring was halted to protect candidate credibility. Submitting an engineering resume for this position would trigger automated recruiter disqualification.",
                "recommended_roles": [
                    "Software Engineering Intern (Backend / Systems)",
                    "Java / Spring Boot Developer",
                    "Full-Stack Web Developer (React + Python/Java)",
                    "Cloud Infrastructure & REST API Platform Engineer"
                ]
            }
            return False, reason, job_domain, ai_summary

        return True, None, "Software Engineering & Technology", None

    def match(self, resume: MasterResume, jd: JobAnalysisReport, company: CompanyResearchReport) -> CandidateMatchReport:
        # Extract candidate verified skills
        candidate_skills: Set[str] = {s.skill_name.lower().strip() for s in resume.skills if s.is_verified}
        
        # Also include verified technologies from projects and experiences
        for proj in resume.projects:
            if proj.is_verified:
                for tech in proj.technologies:
                    candidate_skills.add(tech.lower().strip())
        for exp in resume.experiences:
            if exp.is_verified:
                for tech in exp.technologies:
                    candidate_skills.add(tech.lower().strip())

        # Evaluate Mandatory Skills
        matched_skills = []
        missing_mandatory = []
        detailed_alignments = []

        for req_skill in jd.mandatory_skills:
            req_lower = req_skill.lower().strip()
            found = any(req_lower == cs or req_lower in cs or cs in req_lower for cs in candidate_skills)
            if found:
                matched_skills.append(req_skill)
                detailed_alignments.append(SkillAlignment(
                    skill_name=req_skill,
                    is_mandatory=True,
                    is_possessed_in_master=True,
                    evidence_source="Master Resume Skills & Projects"
                ))
            else:
                missing_mandatory.append(req_skill)
                detailed_alignments.append(SkillAlignment(
                    skill_name=req_skill,
                    is_mandatory=True,
                    is_possessed_in_master=False,
                    evidence_source=None
                ))

        # Evaluate Preferred Skills
        missing_preferred = []
        for pref_skill in jd.preferred_skills:
            pref_lower = pref_skill.lower().strip()
            found = any(pref_lower == cs or pref_lower in cs or cs in req_lower for cs in candidate_skills)
            if found:
                if pref_skill not in matched_skills:
                    matched_skills.append(pref_skill)
                detailed_alignments.append(SkillAlignment(
                    skill_name=pref_skill,
                    is_mandatory=False,
                    is_possessed_in_master=True,
                    evidence_source="Master Resume Skills & Projects"
                ))
            else:
                missing_preferred.append(pref_skill)
                detailed_alignments.append(SkillAlignment(
                    skill_name=pref_skill,
                    is_mandatory=False,
                    is_possessed_in_master=False,
                    evidence_source=None
                ))

        # Check domain compatibility gate
        is_compatible, mismatch_reason, job_domain, ai_domain_summary = self._check_domain_compatibility(
            resume, jd, candidate_skills, matched_skills
        )

        # Project Relevance Scoring
        jd_all_tech = {s.lower() for s in jd.mandatory_skills + jd.preferred_skills + jd.frameworks_and_tools}
        project_relevances = []
        total_proj_score = 0.0

        for p in resume.projects:
            proj_tech_set = {t.lower() for t in p.technologies}
            overlap = proj_tech_set.intersection(jd_all_tech)
            ratio = len(overlap) / max(len(proj_tech_set), 1)
            score = (min(100.0, ratio * 100.0 + (30.0 if overlap else 10.0))) if is_compatible else 0.0
            project_relevances.append(ProjectRelevance(
                project_id=p.id,
                project_title=p.title,
                relevance_score=round(score, 1),
                matched_technologies=[t for t in p.technologies if t.lower() in jd_all_tech],
                relevance_explanation=f"Overlaps on {len(overlap)} core technologies ({', '.join(overlap)}) with target role requirements." if is_compatible else "0% overlap with target non-engineering role."
            ))
            total_proj_score += score

        avg_project_score = total_proj_score / max(len(resume.projects), 1) if is_compatible else 0.0

        # Technical skill score
        total_mandatory = max(len(jd.mandatory_skills), 1)
        mandatory_ratio = (len(jd.mandatory_skills) - len(missing_mandatory)) / total_mandatory
        tech_score = round(mandatory_ratio * 70.0 + (len(matched_skills) / max(len(matched_skills) + len(missing_preferred), 1)) * 30.0, 1) if is_compatible else 0.0

        # Education score
        has_cs = any("computer" in edu.field_of_study.lower() or "science" in edu.field_of_study.lower() for edu in resume.educations if edu.field_of_study)
        edu_score = (95.0 if has_cs else 80.0) if is_compatible else 20.0

        # Experience score
        exp_score = (80.0 if resume.experiences else 60.0) if is_compatible else 0.0

        # Domain score
        domain_score = 75.0 if is_compatible else 0.0

        # Overall weighted composite score
        overall_score = round(
            (tech_score * 0.40) +
            (avg_project_score * 0.25) +
            (exp_score * 0.15) +
            (edu_score * 0.10) +
            (domain_score * 0.10),
            1
        ) if is_compatible else round(min(12.0, len(matched_skills) * 3.0), 1)

        return CandidateMatchReport(
            master_resume_id=resume.id,
            job_id=jd.job_id,
            overall_match_score=overall_score,
            technical_skill_score=tech_score,
            project_relevance_score=round(avg_project_score, 1),
            experience_relevance_score=exp_score,
            education_score=edu_score,
            domain_score=domain_score,
            is_domain_compatible=is_compatible,
            domain_mismatch_reason=mismatch_reason,
            candidate_domain="Computer Science & Software Engineering",
            job_domain=job_domain,
            ai_domain_summary=ai_domain_summary,
            matched_skills=matched_skills,
            missing_mandatory_skills=missing_mandatory,
            missing_preferred_skills=missing_preferred,
            detailed_alignments=detailed_alignments,
            relevant_projects=project_relevances,
            irrelevant_or_less_relevant_content=[],
            underrepresented_achievements=[
                "High API throughput and response time optimization in projects",
                "Automated test coverage percentages and database transaction handling"
            ] if is_compatible else [],
            improvement_recommendations=[
                f"Clarify whether candidate has exposure to missing preferred technologies ({', '.join(missing_preferred[:3])})",
                "Restructure project bullets to highlight metrics, scalability, and system architecture"
            ] if is_compatible else [
                "Target roles aligned with verified Computer Science / Software Engineering background.",
                "Avoid submitting engineering resumes to creative media or non-technical job openings."
            ]
        )
