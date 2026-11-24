from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
import uuid

class RequirementImportance(str, Enum):
    MANDATORY = "MANDATORY"
    PREFERRED = "PREFERRED"
    OPTIONAL = "OPTIONAL"

class RequirementCategory(str, Enum):
    LANGUAGE = "LANGUAGE"
    FRAMEWORK = "FRAMEWORK"
    DATABASE = "DATABASE"
    CLOUD_INFRA = "CLOUD_INFRA"
    DEVELOPER_TOOL = "DEVELOPER_TOOL"
    DOMAIN_KNOWLEDGE = "DOMAIN_KNOWLEDGE"
    SOFT_SKILL = "SOFT_SKILL"
    EDUCATION = "EDUCATION"
    YEARS_EXPERIENCE = "YEARS_EXPERIENCE"

class JobRequirement(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    text: str = Field(..., description="Verbatim or summarized requirement from JD")
    category: RequirementCategory
    importance: RequirementImportance
    standardized_skill: Optional[str] = None
    years_required: Optional[float] = None

class JobDescriptionInput(BaseModel):
    company_name: str = Field(..., description="Target company name")
    job_title: str = Field(..., description="Target job title / role")
    raw_jd_text: str = Field(..., description="Full text of the job description")
    job_url: Optional[str] = None
    location: Optional[str] = None
    seniority_level: Optional[str] = None
    additional_notes: Optional[str] = None

class JobAnalysisReport(BaseModel):
    job_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_name: str
    job_title: str
    role_category: str = Field(..., description="e.g. Backend, Full-Stack, AI/ML, DevOps")
    seniority: str = Field(..., description="Intern, Entry-Level, Junior, Mid, Senior, Lead")
    mandatory_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    programming_languages: List[str] = Field(default_factory=list)
    frameworks_and_tools: List[str] = Field(default_factory=list)
    cloud_and_databases: List[str] = Field(default_factory=list)
    domain_knowledge: List[str] = Field(default_factory=list)
    key_responsibilities: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)
    min_years_experience: Optional[float] = None
    structured_requirements: List[JobRequirement] = Field(default_factory=list)
    summary_analysis: Optional[str] = None
