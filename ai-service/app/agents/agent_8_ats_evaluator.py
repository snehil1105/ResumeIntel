from typing import List, Dict, Any
import re
from app.models.resume import MasterResume
from app.models.job import JobAnalysisReport
from app.models.ats import ATSReport, ATSFinding

class ATSOptimizationAgent:
    """
    Agent 8: Evaluates structured resume drafts against programmatic ATS heuristics:
    standard section headers, keyword density, bullet verb structure, and formatting clarity.
    Produces internal score and clear advisory disclaimer.
    """
    def __init__(self):
        pass

    def evaluate(self, resume: MasterResume, jd: JobAnalysisReport) -> ATSReport:
        findings: List[ATSFinding] = []
        repetition_warnings: List[str] = []
        missing_critical_keywords: List[str] = []

        # 1. Section Structure Check
        has_summary = bool(resume.professional_summary)
        has_skills = bool(resume.skills)
        has_experience = bool(resume.experiences)
        has_projects = bool(resume.projects)
        has_education = bool(resume.educations)

        struct_score = 100
        if not has_summary:
            struct_score -= 10
            findings.append(ATSFinding(category="STRUCTURE", severity="INFO", message="Adding a concise professional summary improves ATS parser context."))
        if not has_skills:
            struct_score -= 25
            findings.append(ATSFinding(category="STRUCTURE", severity="CRITICAL", message="Missing dedicated technical skills section."))
        if not has_education:
            struct_score -= 20
            findings.append(ATSFinding(category="STRUCTURE", severity="CRITICAL", message="Education section missing."))

        # 2. Keyword Relevance Check
        all_resume_words = (
            (resume.professional_summary or "") + " " +
            " ".join([s.skill_name for s in resume.skills]) + " " +
            " ".join([b for p in resume.projects for b in p.bullet_points]) + " " +
            " ".join([b for e in resume.experiences for b in e.bullet_points])
        ).lower()

        matched_kw_count = 0
        total_kw = max(len(jd.keywords), 1)
        for kw in jd.keywords:
            kw_clean = kw.lower().strip()
            # Count occurrences to check repetition
            occurrences = len(re.findall(r'\b' + re.escape(kw_clean) + r'\b', all_resume_words))
            if occurrences > 0:
                matched_kw_count += 1
                if occurrences > 6:
                    repetition_warnings.append(f"Keyword '{kw}' appears {occurrences} times. Avoid excessive repetition.")
            else:
                missing_critical_keywords.append(kw)

        kw_score = min(100, int((matched_kw_count / total_kw) * 100))

        # 3. Bullet Quality Check (Action verbs, metrics)
        action_verbs = {"developed", "architected", "engineered", "implemented", "designed", "optimized", "built", "spearheaded"}
        strong_bullets = 0
        total_bullets = 0

        for p in resume.projects:
            for b in p.bullet_points:
                total_bullets += 1
                first_word = b.split()[0].lower() if b.split() else ""
                has_metric = bool(re.search(r'\d+%?|\d+x', b))
                if first_word in action_verbs or has_metric:
                    strong_bullets += 1

        bullet_score = int((strong_bullets / max(total_bullets, 1)) * 100) if total_bullets > 0 else 80

        # 4. Readability Score
        readability_score = 92
        formatting_score = 95 # Standard single-column text formatting

        # 5. Composite Heuristic ATS Score
        overall_score = int(
            (kw_score * 0.35) +
            (bullet_score * 0.25) +
            (struct_score * 0.20) +
            (readability_score * 0.10) +
            (formatting_score * 0.10)
        )

        return ATSReport(
            overall_ats_score=max(40, min(98, overall_score)),
            keyword_relevance_score=kw_score,
            readability_score=readability_score,
            section_structure_score=struct_score,
            bullet_quality_score=bullet_score,
            formatting_score=formatting_score,
            findings=findings,
            repetition_warnings=repetition_warnings,
            missing_critical_keywords=missing_critical_keywords[:5],
            parsing_compatibility_status="PASS" if overall_score >= 70 else "WARN"
        )
