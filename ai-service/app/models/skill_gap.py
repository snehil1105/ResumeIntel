from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
import uuid

class GapCategory(str, Enum):
    A = "A" # Already possessed but missing from resume
    B = "B" # Possessed but insufficiently demonstrated
    C = "C" # Partially familiar
    D = "D" # Not possessed
    E = "E" # Not applicable

class SkillGapItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    skill_name: str
    importance: str = Field("MANDATORY", description="MANDATORY or PREFERRED")
    gap_category: GapCategory
    explanation: str = Field(..., description="Why this gap was identified and classified into this category")
    verification_question: Optional[str] = Field(None, description="Direct question to candidate when evidence is insufficient")
    user_response: Optional[str] = None
    is_confirmed_by_user: bool = False

class SkillGapReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    candidate_match_id: str
    total_gaps_count: int
    category_counts: dict = Field(default_factory=dict)
    gaps: List[SkillGapItem] = Field(default_factory=list)
    pending_questions: List[SkillGapItem] = Field(default_factory=list)
