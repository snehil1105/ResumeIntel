from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid

class ATSFinding(BaseModel):
    category: str # "STRUCTURE", "KEYWORDS", "READABILITY", "BULLETS", "FORMATTING"
    severity: str # "INFO", "WARNING", "CRITICAL"
    message: str
    suggested_fix: Optional[str] = None

class ATSReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    resume_version_id: Optional[str] = None
    overall_ats_score: int = Field(..., ge=0, le=100)
    keyword_relevance_score: int = Field(..., ge=0, le=100)
    readability_score: int = Field(..., ge=0, le=100)
    section_structure_score: int = Field(..., ge=0, le=100)
    bullet_quality_score: int = Field(..., ge=0, le=100)
    formatting_score: int = Field(..., ge=0, le=100)
    findings: List[ATSFinding] = Field(default_factory=list)
    repetition_warnings: List[str] = Field(default_factory=list)
    missing_critical_keywords: List[str] = Field(default_factory=list)
    parsing_compatibility_status: str = "PASS" # PASS, WARN, FAIL
    disclaimer: str = (
        "This score is an internal heuristic indicator for structural clarity, keyword relevance, and document parsing compatibility. "
        "It is not a commercial ATS vendor algorithm score and does not guarantee interview selection."
    )
