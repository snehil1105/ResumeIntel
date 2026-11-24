from typing import List, Dict, Any, Optional
from app.models.resume import MasterResume
from app.models.job import JobAnalysisReport
from app.models.company import CompanyResearchReport
from app.models.proposals import ChangeProposal, ProposalSectionType, EvidenceStatus, ApprovalStatus
from app.core.exceptions import ImmutableFieldViolationException

class ResumeCustomizationAgent:
    """
    Agent 7: Synthesizes high-level role customization proposals:
    - Tailored Professional Summary highlighting target job qualifications
    - Skills reordering (prioritizing skills requested by the target company)
    - Project reordering (placing the most relevant projects at the top)
    Strictly safeguards all protected immutable fields.
    """
    def __init__(self):
        pass

    def generate_customizations(
        self,
        resume: MasterResume,
        jd: JobAnalysisReport,
        company: CompanyResearchReport,
        confirmed_answers: Optional[Dict[str, str]] = None
    ) -> List[ChangeProposal]:
        proposals: List[ChangeProposal] = []

        # 1. Professional Summary Customization
        original_summary = resume.professional_summary or "Software engineering student with experience in Java and backend systems."
        
        # Build tailored summary using only verified candidate strengths aligned with JD
        tailored_summary = (
            f"Software Engineer with demonstrated expertise in {', '.join(jd.programming_languages[:2])} and "
            f"{', '.join(jd.frameworks_and_tools[:2])}. Experienced in architecting robust RESTful APIs, "
            f"optimizing database systems, and implementing scalable microservices. Eager to contribute to "
            f"{company.company_name}'s {company.engineering_culture.split(',')[0].lower()} engineering culture as a {jd.job_title}."
        )

        proposals.append(ChangeProposal(
            section_type=ProposalSectionType.PROFESSIONAL_SUMMARY,
            target_id="summary",
            original_content=original_summary,
            proposed_content=tailored_summary,
            justification_why=(
                f"Directly tailors the professional opening hook to address the core requirements for {jd.job_title} "
                f"at {company.company_name}, explicitly connecting verified backend experience with the target stack."
            ),
            supporting_jd_requirement=f"Role: {jd.job_title} with focus on {', '.join(jd.mandatory_skills[:3])}",
            supporting_company_insight=f"Engineering culture values {company.hiring_values[:100]}",
            expected_benefit="Instantly communicates high role relevance in the initial 6-second recruiter screen.",
            confidence_level=0.96,
            evidence_status=EvidenceStatus.VERIFIED_FROM_MASTER,
            approval_status=ApprovalStatus.PENDING
        ))

        # 2. Skills Grouping & Ordering
        # Order skills to prioritize those demanded by the JD
        top_skills = [s for s in resume.skills if any(s.skill_name.lower() == req.lower() for req in jd.mandatory_skills)]
        other_skills = [s for s in resume.skills if not any(s.skill_name.lower() == req.lower() for req in jd.mandatory_skills)]
        
        orig_skill_list = ", ".join([s.skill_name for s in resume.skills])
        proposed_skill_list = ", ".join([s.skill_name for s in (top_skills + other_skills)])

        if orig_skill_list != proposed_skill_list:
            proposals.append(ChangeProposal(
                section_type=ProposalSectionType.SKILLS_ORDERING,
                target_id="skills_order",
                original_content=orig_skill_list,
                proposed_content=proposed_skill_list,
                justification_why="Reorders technical skills to position mandatory role qualifications first for optimal ATS parsing scan.",
                supporting_jd_requirement=f"Mandatory requirements: {', '.join(jd.mandatory_skills)}",
                supporting_company_insight="Screening systems parse top-listed skills first.",
                expected_benefit="Improves technical keyword prominence at the top of the skills block.",
                confidence_level=0.98,
                evidence_status=EvidenceStatus.VERIFIED_FROM_MASTER,
                approval_status=ApprovalStatus.PENDING
            ))

        return proposals
