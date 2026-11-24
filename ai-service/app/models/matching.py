from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid

class SkillAlignment(BaseModel):
    skill_name: str
    is_mandatory: bool
    is_possessed_in_master: bool
    evidence_source: Optional[str] = None # e.g. "Projects: E-Commerce Platform" or "Skills: Languages"

class ProjectRelevance(BaseModel):
    project_id: str
    project_title: str
    relevance_score: float = Field(..., ge=0.0, le=100.0)
    matched_technologies: List[str] = Field(default_factory=list)
    relevance_explanation: str

class CandidateMatchReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    master_resume_id: str
    job_id: str
    overall_match_score: float = Field(..., ge=0.0, le=100.0)
    technical_skill_score: float = Field(..., ge=0.0, le=100.0)
    project_relevance_score: float = Field(..., ge=0.0, le=100.0)
    experience_relevance_score: float = Field(..., ge=0.0, le=100.0)
    education_score: float = Field(..., ge=0.0, le=100.0)
    domain_score: float = Field(..., ge=0.0, le=100.0)
    
    # Domain Compatibility & Alignment Gate
    is_domain_compatible: bool = True
    domain_mismatch_reason: Optional[str] = None
    candidate_domain: str = "Computer Science & Software Engineering"
    job_domain: Optional[str] = None
    ai_domain_summary: Optional[Dict[str, Any]] = None

    matched_skills: List[str] = Field(default_factory=list)
    missing_mandatory_skills: List[str] = Field(default_factory=list)
    missing_preferred_skills: List[str] = Field(default_factory=list)
    
    detailed_skill_alignments: List[SkillAlignment] = Field(default_factory=list)
    relevant_projects: List[ProjectRelevance] = Field(default_factory=list)
    irrelevant_or_less_relevant_content: List[str] = Field(default_factory=list)
    underrepresented_achievements: List[str] = Field(default_factory=list)
    improvement_recommendations: List[str] = Field(default_factory=list)
