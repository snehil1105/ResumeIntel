from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from datetime import datetime
import uuid

class SourceType(str, Enum):
    OFFICIAL_CAREERS = "OFFICIAL_CAREERS"
    ENGINEERING_BLOG = "ENGINEERING_BLOG"
    PUBLIC_REPORTS = "PUBLIC_REPORTS"
    TECH_PUBLICATION = "TECH_PUBLICATION"
    OFFICIAL_DOCS = "OFFICIAL_DOCS"
    PUBLIC_JOB_POSTINGS = "PUBLIC_JOB_POSTINGS"
    PUBLIC_PROFESSIONAL_INFO = "PUBLIC_PROFESSIONAL_INFO"

class ConfidenceLevel(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class ResearchSource(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(..., description="Document or page title")
    url: str = Field(..., description="Direct verifiable public URL")
    source_type: SourceType
    publication_date: Optional[str] = None
    retrieval_date: str = Field(default_factory=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    confidence_level: ConfidenceLevel = ConfidenceLevel.HIGH
    is_official_company_source: bool = False
    is_observed_pattern: bool = True
    extracted_finding: str = Field(..., description="Exact verifiable insight derived from source")

class ObservedTechnology(BaseModel):
    name: str
    frequency_percentage: int = Field(..., ge=0, le=100)
    category: str # Language, Framework, Cloud, Database, Tool
    is_core_stack: bool = True
    evidence_count: int = 1

class ObservedPattern(BaseModel):
    title: str
    pattern_description: str
    is_factual_requirement: bool = False # False if observed pattern, True if explicit requirement
    source_citation: Optional[str] = None

class SelectionStage(BaseModel):
    round_number: int
    stage_name: str
    description: str
    source: str = "Public Recruitment & Interview Reports"

class CandidateAlignment(BaseModel):
    fit_percentage: int = 85
    matched_strengths: List[str] = Field(default_factory=list)
    gap_skills: List[str] = Field(default_factory=list)
    recommended_focus: str = ""

class CompanyResearchReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_name: str
    job_title: Optional[str] = None
    is_known_company: bool = True
    status_message: Optional[str] = None
    business_model: str = Field(..., description="Company business model and primary revenue drivers")
    products_and_services: str = Field(..., description="Flagship tech products or enterprise services")
    engineering_culture: str = Field(..., description="Publicly stated engineering culture and philosophy")
    hiring_values: str = Field(..., description="Publicly stated hiring principles")
    selection_procedure: List[SelectionStage] = Field(default_factory=list)
    company_requirements: List[str] = Field(default_factory=list)
    candidate_alignment: Optional[CandidateAlignment] = None
    observed_tech_stack: List[ObservedTechnology] = Field(default_factory=list)
    observed_employee_patterns: List[ObservedPattern] = Field(default_factory=list)
    sources: List[ResearchSource] = Field(default_factory=list)
    overall_confidence_score: float = Field(0.85, ge=0.0, le=1.0)
    research_date: str = Field(default_factory=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    disclaimer: str = (
        "Patterns are derived from public engineering publications, job postings, and official career communications. "
        "They indicate technical trends and do not represent guaranteed selection criteria."
    )
