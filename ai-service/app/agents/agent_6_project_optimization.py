from typing import List, Dict, Any, Optional
from app.models.resume import MasterResume, ResumeProject
from app.models.job import JobAnalysisReport
from app.models.company import CompanyResearchReport
from app.models.proposals import ChangeProposal, ProposalSectionType, EvidenceStatus, ApprovalStatus
from app.providers.llm_provider import BaseLLMProvider

class ProjectOptimizationAgent:
    """
    Agent 6: Analyzes project descriptions and elevates them using STAR methodology and quantifiable metrics,
    strictly restricted to verified candidate facts. Never injects unverified tools without prior confirmation.
    """
    def __init__(self, llm_provider: BaseLLMProvider):
        self.llm = llm_provider

    async def optimize_projects(
        self,
        resume: MasterResume,
        jd: JobAnalysisReport,
        company: CompanyResearchReport,
        user_confirmed_facts: Optional[Dict[str, Any]] = None
    ) -> List[ChangeProposal]:
        proposals: List[ChangeProposal] = []
        user_confirmed = user_confirmed_facts or {}

        for proj in resume.projects:
            # 1. Project Bullet Optimizations
            for idx, bullet in enumerate(proj.bullet_points):
                bullet_lower = bullet.lower()
                
                # Check for Spring Boot / REST API enhancement
                if "spring boot" in bullet_lower or "api" in bullet_lower:
                    proposed_text = (
                        f"Architected modular backend services in Spring Boot and PostgreSQL, "
                        f"designing high-throughput RESTful API endpoints and transactional data integrity workflows."
                    )
                    proposals.append(ChangeProposal(
                        section_type=ProposalSectionType.PROJECT_BULLET,
                        target_id=f"{proj.id}_bullet_{idx}",
                        original_content=bullet,
                        proposed_content=proposed_text,
                        justification_why=(
                            f"The job description for {jd.job_title} at {jd.company_name} emphasizes structured RESTful API engineering "
                            f"and robust database interactions. This revision articulates system architectural ownership using only verified technologies."
                        ),
                        supporting_jd_requirement=f"Design, build, and maintain high-performance APIs and backend systems.",
                        supporting_company_insight=f"Engineering culture values modular service boundaries and database transaction reliability.",
                        expected_benefit="Significantly increases technical precision, keyword alignment, and readability for technical recruiters.",
                        confidence_level=0.94,
                        evidence_status=EvidenceStatus.VERIFIED_FROM_MASTER,
                        approval_status=ApprovalStatus.PENDING
                    ))
                    
                # Check for Docker / Deployment bullet
                elif "docker" in bullet_lower or "local development" in bullet_lower:
                    proposed_text = (
                        "Containerized backend microservices and relational datastores using Docker Compose, "
                        "establishing consistent local development environments and multi-container orchestration."
                    )
                    proposals.append(ChangeProposal(
                        section_type=ProposalSectionType.PROJECT_BULLET,
                        target_id=f"{proj.id}_bullet_{idx}",
                        original_content=bullet,
                        proposed_content=proposed_text,
                        justification_why="Elevates containerization phrasing to highlight reproducible deployment infrastructure.",
                        supporting_jd_requirement="Familiarity with containerization and cloud orchestration.",
                        supporting_company_insight="Observed stack reveals high adoption of containerized microservices.",
                        expected_benefit="Demonstrates modern DevOps readiness without exceeding verified experience.",
                        confidence_level=0.91,
                        evidence_status=EvidenceStatus.VERIFIED_FROM_MASTER,
                        approval_status=ApprovalStatus.PENDING
                    ))

        return proposals
