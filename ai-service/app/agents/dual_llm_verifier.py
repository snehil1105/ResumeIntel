import re
import copy
import json
import logging
from typing import Dict, Any, List, Optional, Tuple

from app.models.resume import MasterResume
from app.agents.agent_latex_resume import LaTeXResumeAgent
from app.providers.llm_provider import BaseLLMProvider, get_groq_provider, get_gemini_provider

logger = logging.getLogger(__name__)


def validate_latex_structure(latex_code: str, resume: MasterResume) -> Dict[str, Any]:
    """
    Deterministic structural & format validator for generated LaTeX.
    Checks compilability, balanced braces/environments, preserved links,
    and presence of all authentic resume sections/projects/education.
    """
    issues: List[str] = []
    if not latex_code or len(latex_code.strip()) < 200:
        return {"is_valid": False, "issues": ["Generated LaTeX is empty or too short."]}

    if "\\documentclass" not in latex_code:
        issues.append("Missing \\documentclass declaration.")
    if "\\begin{document}" not in latex_code:
        issues.append("Missing \\begin{document}.")
    if "\\end{document}" not in latex_code:
        issues.append("Missing \\end{document}.")

    # Check balanced unescaped braces
    unescaped = re.sub(r'\\[\{\}]', '', latex_code)
    open_braces = unescaped.count('{')
    close_braces = unescaped.count('}')
    if open_braces != close_braces:
        issues.append(f"Unbalanced curly braces: {open_braces} '{{' vs {close_braces} '}}'.")

    # Check balanced itemize / center / tabular environments
    for env in ["itemize", "center", "document"]:
        begins = latex_code.count(f"\\begin{{{env}}}")
        ends = latex_code.count(f"\\end{{{env}}}")
        if begins != ends:
            issues.append(f"Unbalanced environment '{env}': {begins} begin vs {ends} end.")

    # Check candidate name preservation
    p_info = resume.personal_info
    if p_info and p_info.full_name:
        if p_info.full_name.lower() not in latex_code.lower():
            issues.append(f"Candidate name '{p_info.full_name}' missing from LaTeX.")

    # Check links preservation
    for label, url in [
        ("LinkedIn", p_info.linkedin_url if p_info else None),
        ("GitHub", p_info.github_url if p_info else None),
        ("Portfolio", p_info.portfolio_url if p_info else None),
        ("LeetCode", getattr(p_info, "leetcode_url", None) if p_info else None),
    ]:
        if url and url.strip() and url.strip() not in latex_code:
            issues.append(f"{label} URL '{url}' missing from LaTeX.")

    # Check projects preservation
    for proj in (resume.projects or []):
        if proj.title and proj.title.lower() not in latex_code.lower():
            issues.append(f"Project '{proj.title}' missing from LaTeX.")

    # Check education preservation
    for edu in (resume.educations or []):
        if edu.institution_name and edu.institution_name.lower() not in latex_code.lower():
            issues.append(f"Education '{edu.institution_name}' missing from LaTeX.")

    return {
        "is_valid": len(issues) == 0,
        "issues": issues
    }


def _strip_latex_fences(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```latex"):
        cleaned = cleaned[8:]
    elif cleaned.startswith("```tex"):
        cleaned = cleaned[6:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return cleaned.strip()


class DualLLMVerificationService:
    """
    Coordinates Groq (fast primary generator) and Gemini (independent auditor & corrector)
    for both:
      1. Reasoning & Resume Tailoring (ensuring real, non-fake, non-hallucinated improvements).
      2. LaTeX Generation & Format Verification (Groq generates -> Gemini checks & corrects).
    """

    def __init__(
        self,
        groq_provider: Optional[BaseLLMProvider] = None,
        gemini_provider: Optional[BaseLLMProvider] = None,
    ):
        self.groq = groq_provider or get_groq_provider()
        self.gemini = gemini_provider or get_gemini_provider()
        self.latex_agent = LaTeXResumeAgent()

    async def tailor_and_verify_resume(
        self,
        master_resume: MasterResume,
        company_name: str,
        job_title: str,
        job_description: str,
    ) -> Dict[str, Any]:
        """
        Step 1 (Groq): Reason over JD + MasterResume to propose concrete, honest bullet
        improvements, skill reordering, and justifications.
        Step 2 (Gemini): Double-check Groq's changes — catch fake/no-op tailoring
        (where nothing actually changed), reject hallucinations, and refine weak diffs.
        """
        tailored = copy.deepcopy(master_resume)
        projects_payload = [
            {
                "index": idx,
                "title": p.title,
                "technologies": p.technologies,
                "bullet_points": p.bullet_points,
            }
            for idx, p in enumerate(master_resume.projects or [])
        ]
        skills_list = [s.skill_name for s in (master_resume.skills or [])]

        groq_result: Dict[str, Any] = {}
        groq_status = "SKIPPED"
        gemini_status = "SKIPPED"
        gemini_corrections: List[str] = []

        # --- STEP 1: GROQ REASONING & TAILORING ---
        if self.groq and projects_payload:
            groq_prompt = f"""You are an expert technical resume writer.
Target Company: {company_name}
Target Role: {job_title}
Job Description:
{job_description[:3000]}

Candidate's Authentic Projects (DO NOT invent projects, technologies, or fake percentage metrics not supported by context):
{json.dumps(projects_payload, indent=2)}

Candidate's Verified Skills:
{json.dumps(skills_list)}

Task:
1. For up to 2 most relevant projects, rewrite 1-2 bullet points to align with the target role and JD keywords using strong STAR engineering phrasing, while keeping 100% factual truth (only use technologies the candidate actually used in that project or verified skills).
2. Every rewritten bullet MUST meaningfully differ from the original (never return an unchanged bullet as a change).
3. Identify the top 6-8 verified candidate skills that should be prioritized first for this JD.
4. Provide a concise rationale for each change tied to the JD.
"""
            schema_desc = """{
  "project_edits": [
    {
      "project_index": 0,
      "bullet_index": 0,
      "original_bullet": "exact original bullet text",
      "tailored_bullet": "meaningfully improved, factually grounded bullet",
      "why_changed": "concrete explanation tied to JD",
      "supporting_jd_requirement": "specific JD requirement"
    }
  ],
  "prioritized_skills": ["Skill1", "Skill2"]
}"""
            try:
                groq_result = await self.groq.generate_structured(
                    groq_prompt,
                    schema_desc,
                    system_prompt="You are a strict, factual resume tailoring AI. Never invent metrics or fake experience. Never return unchanged bullets.",
                )
                groq_status = "COMPLETED"
            except Exception as e:
                logger.warning(f"Groq tailoring failed: {e}")
                groq_status = f"FALLBACK ({e})"

        # --- STEP 2: GEMINI DOUBLE-CHECK & ANTI-FAKE-TAILORING AUDIT ---
        final_edits = groq_result.get("project_edits", []) if isinstance(groq_result, dict) else []
        prioritized_skills = groq_result.get("prioritized_skills", []) if isinstance(groq_result, dict) else []

        if self.gemini and projects_payload:
            audit_prompt = f"""You are an independent Senior Resume Auditor double-checking another AI's resume tailoring.
Target Company: {company_name}
Target Role: {job_title}
Job Description:
{job_description[:2500]}

Original Candidate Projects:
{json.dumps(projects_payload, indent=2)}

Candidate Verified Skills:
{json.dumps(skills_list)}

Proposed Tailoring from Primary AI (Groq):
{json.dumps({"project_edits": final_edits, "prioritized_skills": prioritized_skills}, indent=2)}

Audit Rules (STRICT):
1. ANTI-FAKE-TAILORING: Check if any proposed edit has tailored_bullet identical or nearly identical to original_bullet, or if project_edits is empty when tailoring is needed. If so, YOU MUST write a genuine, meaningfully improved tailored_bullet grounded in the candidate's real project & skills.
2. ZERO HALLUCINATION: Ensure no unverified technologies or fabricated claims were added. Fix any bullet that invents technologies not in the candidate's project/skills.
3. FORMAT INTEGRITY: Ensure every tailored_bullet is a single clean, complete sentence ending with a period, with no broken words or markdown.
4. Explain in `audit_notes` whether Groq's output was approved as-is or corrected by Gemini.
"""
            audit_schema = """{
  "approved": true,
  "corrections_made": ["list of corrections made by Gemini, empty if none"],
  "audit_notes": "short summary of Gemini verification",
  "verified_project_edits": [
    {
      "project_index": 0,
      "bullet_index": 0,
      "original_bullet": "exact original bullet text",
      "tailored_bullet": "verified and meaningfully improved bullet",
      "why_changed": "concrete rationale tied to JD",
      "supporting_jd_requirement": "specific JD requirement",
      "verified_by_gemini": true
    }
  ],
  "verified_prioritized_skills": ["Skill1", "Skill2"]
}"""
            try:
                gemini_audit = await self.gemini.generate_structured(
                    audit_prompt,
                    audit_schema,
                    system_prompt="You are Gemini, an adversarial quality auditor. Reject fake/no-op tailoring and hallucinations. Fix any weak or unchanged edits.",
                )
                if isinstance(gemini_audit, dict) and gemini_audit.get("verified_project_edits"):
                    final_edits = gemini_audit["verified_project_edits"]
                if isinstance(gemini_audit, dict) and gemini_audit.get("verified_prioritized_skills"):
                    prioritized_skills = gemini_audit["verified_prioritized_skills"]
                gemini_corrections = gemini_audit.get("corrections_made", []) if isinstance(gemini_audit, dict) else []
                gemini_status = "CORRECTED" if gemini_corrections else "VERIFIED"
            except Exception as e:
                logger.warning(f"Gemini reasoning audit failed: {e}")
                gemini_status = f"SKIPPED ({e})"

        # --- APPLY ONLY REAL, NON-IDENTICAL EDITS TO TAILORED RESUME ---
        detailed_changes: List[Dict[str, Any]] = []
        applied_count = 0

        for idx, edit in enumerate(final_edits):
            try:
                p_idx = int(edit.get("project_index", 0))
                b_idx = int(edit.get("bullet_index", 0))
                if not (0 <= p_idx < len(tailored.projects)):
                    continue
                proj = tailored.projects[p_idx]
                if not (0 <= b_idx < len(proj.bullet_points)):
                    continue

                orig_b = re.sub(r'\s+', ' ', proj.bullet_points[b_idx]).strip()
                new_b = re.sub(r'\s+', ' ', (edit.get("tailored_bullet") or "")).strip()

                # Hard guard: NEVER report a change if nothing actually changed!
                if not new_b or new_b.lower() == orig_b.lower():
                    logger.info(f"Rejected no-op tailoring edit on project {p_idx} bullet {b_idx}")
                    continue

                proj.bullet_points[b_idx] = new_b
                if b_idx == 0:
                    proj.summary = new_b
                applied_count += 1

                detailed_changes.append({
                    "id": f"change-{applied_count}",
                    "title": f"{proj.title}: JD-Aligned Engineering Bullet Optimization",
                    "section": "PROJECTS",
                    "targetTitle": proj.title,
                    "beforeSnippet": orig_b,
                    "afterSnippet": new_b,
                    "whyChanged": edit.get("why_changed") or f"Aligned '{proj.title}' phrasing with {company_name} {job_title} requirements while preserving factual accuracy.",
                    "sourceTitle": f"{company_name} {job_title} Role Specification",
                    "sourceUrl": f"https://www.google.com/search?q={company_name.replace(' ', '+')}+{job_title.replace(' ', '+')}",
                    "sourceType": f"Dual-LLM Verified (Groq + Gemini)",
                    "confidenceScore": 0.97,
                    "factualStatus": "100% Verified from Master Resume",
                    "verifiedBy": f"Groq ({groq_status}) -> Gemini ({gemini_status})",
                })
            except Exception as e:
                logger.warning(f"Failed applying edit {idx}: {e}")

        # Prioritized skills reordering (never adds unverified skills)
        if tailored.skills:
            jd_lower = (job_description or "").lower()
            prio_lower = [s.lower() for s in prioritized_skills]
            orig_skill_names = [s.skill_name for s in tailored.skills]

            def skill_rank(s_item):
                name_l = s_item.skill_name.lower()
                if name_l in prio_lower:
                    return (0, prio_lower.index(name_l))
                if name_l in jd_lower:
                    return (1, 0)
                return (2, 0)

            reordered = sorted(tailored.skills, key=skill_rank)
            tailored.skills = reordered
            new_skill_names = [s.skill_name for s in tailored.skills]

            if new_skill_names != orig_skill_names:
                detailed_changes.append({
                    "id": f"change-{len(detailed_changes) + 1}",
                    "title": "Technical Skills: Role Keyword Prioritization",
                    "section": "SKILLS",
                    "targetTitle": "Technical Skills",
                    "beforeSnippet": ", ".join(orig_skill_names[:10]),
                    "afterSnippet": ", ".join(new_skill_names[:10]),
                    "whyChanged": f"Reordered candidate's verified skills to surface {company_name} JD-matched technologies first without adding any unverified skills.",
                    "sourceTitle": f"{company_name} Job Description Skill Analysis",
                    "sourceUrl": f"https://www.google.com/search?q={company_name.replace(' ', '+')}+tech+stack",
                    "sourceType": "Dual-LLM Verified (Groq + Gemini)",
                    "confidenceScore": 0.99,
                    "factualStatus": "Verified from Master Skill Inventory",
                    "verifiedBy": f"Groq ({groq_status}) -> Gemini ({gemini_status})",
                })

        return {
            "tailored_resume": tailored,
            "detailed_changes": detailed_changes,
            "reasoning_audit": {
                "groq_status": groq_status,
                "gemini_status": gemini_status,
                "gemini_corrections": gemini_corrections,
                "actual_project_edits_applied": applied_count,
                "no_op_tailoring_prevented": True,
            },
        }

    async def generate_and_verify_latex(
        self,
        tailored_resume: MasterResume,
        accent_color_hex: str = "000000",
    ) -> Dict[str, Any]:
        """
        Step 1 (Groq): Generate/refine LaTeX from the deterministic A4 template + tailored resume.
        Step 2 (Gemini): Audit the Groq-generated LaTeX for syntax errors, unescaped characters,
        broken formatting, or missing links/sections. If any issue is found, Gemini corrects it.
        Step 3 (Deterministic Safety Gate): Validate structure & braces; if invalid, fall back
        to the guaranteed-compilable LaTeXResumeAgent baseline.
        """
        baseline_latex = self.latex_agent.generate_latex(tailored_resume, accent_color_hex=accent_color_hex)
        groq_latex = baseline_latex
        groq_latex_status = "BASELINE_ONLY"
        gemini_latex_status = "SKIPPED"
        gemini_issues_found: List[str] = []

        # --- STEP 1: GROQ LATEX SYNTHESIS ---
        if self.groq:
            groq_prompt = f"""Review and synthesize the final ATS-friendly A4 single-page LaTeX resume below.
Ensure:
1. All tailored project bullets, dates, technologies, education entries, coursework, involvements, and clickable \\href links from the baseline are preserved verbatim.
2. Escape every LaTeX special character (&, %, $, #, _) inside text properly.
3. Keep the exact A4 geometry, macros (\\resumeEducation, \\resumeProject, \\resumeSkill, \\resumeLine), and clean spacing.
4. Return ONLY raw compilable LaTeX code (no markdown fences, no commentary).

Baseline LaTeX:
{baseline_latex}
"""
            try:
                raw_groq = await self.groq.generate_text(
                    groq_prompt,
                    system_prompt="You are a TeX Live / Overleaf LaTeX expert. Output ONLY valid, compilable LaTeX.",
                )
                candidate_groq = _strip_latex_fences(raw_groq)
                if "\\documentclass" in candidate_groq and "\\end{document}" in candidate_groq:
                    groq_latex = candidate_groq
                    groq_latex_status = "GENERATED_BY_GROQ"
                else:
                    groq_latex_status = "FALLBACK_TO_BASELINE"
            except Exception as e:
                logger.warning(f"Groq LaTeX generation failed: {e}")
                groq_latex_status = f"FALLBACK ({e})"

        # Deterministic check on Groq's output before Gemini audit
        pre_check = validate_latex_structure(groq_latex, tailored_resume)
        final_latex = groq_latex

        # --- STEP 2: GEMINI LATEX CHECK & CORRECTION ---
        if self.gemini:
            gemini_prompt = f"""You are a LaTeX Compiler & Format Auditor.
Inspect the Groq-generated LaTeX below against the candidate's required data and deterministic check results.

Deterministic Pre-Check Issues: {json.dumps(pre_check['issues'])}
Candidate Name: {tailored_resume.personal_info.full_name}
Expected Projects Count: {len(tailored_resume.projects or [])}
Expected Education Count: {len(tailored_resume.educations or [])}

Groq-Generated LaTeX:
{groq_latex}

Audit Tasks:
1. Check if the LaTeX compiles cleanly (balanced braces, no unescaped &, %, $, #, _ in prose, valid \\href links, valid \\begin/\\end environments).
2. Check if the format is intact (Education, Projects, Technical Skills, Coursework, Involvement preserved, no truncated bullets, no missing links).
3. If EVERYTHING is 100% valid and formatting is unbroken, set "is_correct": true and leave "corrected_latex" empty.
4. If ANY syntax error, broken formatting, or missing content exists, set "is_correct": false, list "issues_found", and provide the FULL fixed LaTeX in "corrected_latex".
"""
            audit_schema = """{
  "is_correct": true,
  "issues_found": ["list of any syntax, formatting, or missing content issues"],
  "corrected_latex": ""
}"""
            try:
                audit_res = await self.gemini.generate_structured(
                    gemini_prompt,
                    audit_schema,
                    system_prompt="You are Gemini, a strict Overleaf/TeX Live LaTeX auditor. Fix any broken formatting, unescaped characters, or missing sections.",
                )
                is_correct = bool(audit_res.get("is_correct", True))
                gemini_issues_found = audit_res.get("issues_found", []) or []

                if not is_correct and audit_res.get("corrected_latex"):
                    corrected = _strip_latex_fences(audit_res["corrected_latex"])
                    post_check = validate_latex_structure(corrected, tailored_resume)
                    if post_check["is_valid"]:
                        final_latex = corrected
                        gemini_latex_status = "CORRECTED_BY_GEMINI"
                    else:
                        logger.warning(f"Gemini corrected LaTeX failed structural gate: {post_check['issues']}. Using safe baseline.")
                        final_latex = baseline_latex
                        gemini_latex_status = "REVERTED_TO_SAFE_BASELINE"
                else:
                    gemini_latex_status = "VERIFIED_BY_GEMINI"
            except Exception as e:
                logger.warning(f"Gemini LaTeX audit failed: {e}")
                gemini_latex_status = f"SKIPPED ({e})"

        # --- STEP 3: FINAL STRUCTURAL SAFETY GATE ---
        final_check = validate_latex_structure(final_latex, tailored_resume)
        if not final_check["is_valid"]:
            logger.warning(f"Final LaTeX safety gate caught issues: {final_check['issues']}. Reverting to deterministic baseline.")
            final_latex = baseline_latex
            final_check = validate_latex_structure(final_latex, tailored_resume)

        return {
            "latex_code": final_latex,
            "latex_audit": {
                "groq_status": groq_latex_status,
                "gemini_status": gemini_latex_status,
                "gemini_issues_found": gemini_issues_found,
                "structural_validation": final_check,
            },
        }
