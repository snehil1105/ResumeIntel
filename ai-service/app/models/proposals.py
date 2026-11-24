from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
import uuid

class ProposalSectionType(str, Enum):
    PROFESSIONAL_SUMMARY = "PROFESSIONAL_SUMMARY"
    SKILLS_GROUPING = "SKILLS_GROUPING"
    SKILLS_ORDERING = "SKILLS_ORDERING"
    PROJECT_TITLE = "PROJECT_TITLE"
    PROJECT_DESCRIPTION = "PROJECT_DESCRIPTION"
    PROJECT_BULLET = "PROJECT_BULLET"
    PROJECT_ORDERING = "PROJECT_ORDERING"
    ACHIEVEMENT = "ACHIEVEMENT"

class ApprovalStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EDITED = "EDITED"
    SAVED_FOR_LATER = "SAVED_FOR_LATER"

class EvidenceStatus(str, Enum):
    VERIFIED_FROM_MASTER = "VERIFIED_FROM_MASTER"
    USER_CONFIRMED = "USER_CONFIRMED"
    PENDING_USER_VERIFICATION = "PENDING_USER_VERIFICATION"
    SPECULATIVE_REJECTED = "SPECULATIVE_REJECTED"

class ChangeProposal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    candidate_match_id: Optional[str] = None
    section_type: ProposalSectionType
    target_id: Optional[str] = Field(None, description="ID of project/skill or section being modified")
    original_content: str = Field(..., description="Current verbatim content in Master Resume")
    proposed_content: str = Field(..., description="Optimized, role-tailored content")
    justification_why: str = Field(..., description="Why this modification is recommended")
    supporting_jd_requirement: str = Field(..., description="Direct JD requirement supporting this change")
    supporting_company_insight: Optional[str] = Field(None, description="Observed company engineering practice or value")
    expected_benefit: str = Field(..., description="How this improves relevance, readability, or ATS score")
    confidence_level: float = Field(0.9, ge=0.0, le=1.0)
    evidence_status: EvidenceStatus = EvidenceStatus.VERIFIED_FROM_MASTER
    approval_status: ApprovalStatus = ApprovalStatus.PENDING
    user_edited_content: Optional[str] = None
    verification_question: Optional[str] = None
    user_verification_answer: Optional[str] = None

class ProposalDecisionRequest(BaseModel):
    proposal_id: str
    action: ApprovalStatus # APPROVED, REJECTED, EDITED, SAVED_FOR_LATER
    user_edited_content: Optional[str] = None
    verification_answer: Optional[str] = None
    feedback_notes: Optional[str] = None
