from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
from .resume import MasterResume
from .job import JobDescriptionInput, JobAnalysisReport
from .company import CompanyResearchReport
from .matching import CandidateMatchReport
from .proposals import ChangeProposal
from .ats import ATSReport

class ResumeVersionModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    master_resume_id: str
    job_id: str
    company_name: str
    job_title: str
    version_tag: str = Field(..., description="e.g. 'Google - Backend Intern - v1'")
    version_number: int = 1
    
    # Snapshots
    customized_resume: MasterResume
    original_master_snapshot: MasterResume
    job_analysis_snapshot: Optional[JobAnalysisReport] = None
    company_research_snapshot: Optional[CompanyResearchReport] = None
    matching_snapshot: Optional[CandidateMatchReport] = None
    proposals_history: List[ChangeProposal] = Field(default_factory=list)
    approved_changes_count: int = 0
    ats_report: Optional[ATSReport] = None
    
    pdf_path: Optional[str] = None
    docx_path: Optional[str] = None
    is_exported: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
