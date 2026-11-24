from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

# 1. Protected Personal Identity (IMMUTABLE)
class ProtectedPersonalInfo(BaseModel):
    full_name: str = Field(..., description="Candidate full legal name. IMMUTABLE.")
    email: str = Field(..., description="Contact email. IMMUTABLE.")
    phone: Optional[str] = Field(None, description="Contact phone. IMMUTABLE.")
    location: Optional[str] = Field(None, description="City, State/Country. IMMUTABLE.")
    linkedin_url: Optional[str] = Field(None, description="LinkedIn profile URL. IMMUTABLE.")
    github_url: Optional[str] = Field(None, description="GitHub profile URL. IMMUTABLE.")
    portfolio_url: Optional[str] = Field(None, description="Personal website/portfolio URL. IMMUTABLE.")
    leetcode_url: Optional[str] = Field(None, description="LeetCode profile URL. IMMUTABLE.")

# 2. Protected Education Record (IMMUTABLE)
class ProtectedEducation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    institution_name: str = Field(..., description="University/College name. IMMUTABLE.")
    degree: str = Field(..., description="Degree type (e.g., B.Tech, B.S., M.S.). IMMUTABLE.")
    field_of_study: Optional[str] = Field(None, description="Major / Field of Study. IMMUTABLE.")
    grade_or_gpa: Optional[str] = Field(None, description="GPA or percentage. IMMUTABLE.")
    start_date: Optional[str] = Field(None, description="Start date (Month Year). IMMUTABLE.")
    end_date: Optional[str] = Field(None, description="End date / Expected graduation. IMMUTABLE.")
    location: Optional[str] = Field(None, description="Institution location. IMMUTABLE.")
    is_verified: bool = True

# 3. Protected Employment Record (IMMUTABLE CHRONOLOGY)
class ProtectedExperience(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_name: str = Field(..., description="Employer name. IMMUTABLE.")
    job_title: str = Field(..., description="Official designation. IMMUTABLE.")
    location: Optional[str] = Field(None, description="Work location. IMMUTABLE.")
    start_date: str = Field(..., description="Employment start date. IMMUTABLE.")
    end_date: Optional[str] = Field(None, description="Employment end date or 'Present'. IMMUTABLE.")
    is_current: bool = False
    description: Optional[str] = None
    bullet_points: List[str] = Field(default_factory=list, description="Responsibilities and achievements.")
    technologies: List[str] = Field(default_factory=list)
    is_verified: bool = True

# 4. Resume Project (Customizable / Optimizable with verified details)
class ResumeProject(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(..., description="Project name")
    role: Optional[str] = Field(None, description="Role within project (e.g., Lead Developer)")
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    summary: Optional[str] = Field(None, description="High-level project overview")
    technologies: List[str] = Field(default_factory=list, description="Verified technologies implemented")
    bullet_points: List[str] = Field(default_factory=list, description="STAR implementation and metric bullets")
    repo_url: Optional[str] = None
    demo_url: Optional[str] = None
    is_verified: bool = True

# 5. Skill Item
class SkillItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: str = Field(..., description="Category: Languages, Frameworks, Databases, Cloud/DevOps, Tools")
    skill_name: str = Field(..., description="Standardized skill name")
    proficiency_level: str = Field("INTERMEDIATE", description="BEGINNER, INTERMEDIATE, ADVANCED, EXPERT")
    years_experience: Optional[float] = None
    is_verified: bool = True

# 6. Master Resume (Single Source of Truth)
class MasterResume(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    personal_info: ProtectedPersonalInfo
    headline: Optional[str] = None
    professional_summary: Optional[str] = None
    educations: List[ProtectedEducation] = Field(default_factory=list)
    experiences: List[ProtectedExperience] = Field(default_factory=list)
    projects: List[ResumeProject] = Field(default_factory=list)
    skills: List[SkillItem] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)
    coursework: List[str] = Field(default_factory=list)
    involvements: List[str] = Field(default_factory=list)
    section_order: List[str] = Field(default_factory=lambda: ["education", "projects", "skills", "coursework", "involvement"])
    latex_code: Optional[str] = None
    version_number: int = 1
    raw_text: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def get_protected_field_values(self) -> Dict[str, Any]:
        """Returns snapshot of immutable fields to detect tampering."""
        return {
            "personal_info": self.personal_info.model_dump(),
            "educations": [
                {
                    "institution": edu.institution_name,
                    "degree": edu.degree,
                    "field": edu.field_of_study,
                    "dates": f"{edu.start_date}-{edu.end_date}"
                } for edu in self.educations
            ],
            "experiences": [
                {
                    "company": exp.company_name,
                    "title": exp.job_title,
                    "dates": f"{exp.start_date}-{exp.end_date}"
                } for exp in self.experiences
            ]
        }
