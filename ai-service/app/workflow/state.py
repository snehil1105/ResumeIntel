from typing import TypedDict, List, Dict, Any, Optional
from app.models.resume import MasterResume
from app.models.job import JobDescriptionInput, JobAnalysisReport
from app.models.company import CompanyResearchReport
from app.models.matching import CandidateMatchReport
from app.models.skill_gap import SkillGapReport
from app.models.proposals import ChangeProposal
from app.models.ats import ATSReport

class WorkflowAgentState(TypedDict, total=False):
    # Workflow Metadata
    workflow_id: str
    user_id: str
    current_step: str
    status: str # "IN_PROGRESS", "AWAITING_APPROVAL", "COMPLETED", "FAILED"
    
    # Inputs
    raw_resume_text: Optional[str]
    job_input: JobDescriptionInput
    user_answers: Dict[str, str]
    user_decisions: Dict[str, Any]
    
    # Agent Artifacts
    master_resume: MasterResume
    job_analysis: JobAnalysisReport
    company_research: CompanyResearchReport
    candidate_match: CandidateMatchReport
    skill_gap_report: SkillGapReport
    proposals: List[ChangeProposal]
    approved_proposals: List[ChangeProposal]
    customized_resume: MasterResume
    ats_report: ATSReport
    
    # Audit & Observability
    execution_logs: List[Dict[str, Any]]
    quality_violations: List[str]
    error: Optional[str]
