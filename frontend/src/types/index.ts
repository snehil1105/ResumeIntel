export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export interface ProtectedPersonalInfo {
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  leetcode_url?: string;
}

export interface ProtectedEducation {
  id: string;
  institution_name: string;
  degree: string;
  field_of_study?: string;
  grade_or_gpa?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  is_verified: boolean;
}

export interface ProtectedExperience {
  id: string;
  company_name: string;
  job_title: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current?: boolean;
  bullet_points: string[];
  technologies: string[];
  is_verified: boolean;
}

export interface ResumeProject {
  id: string;
  title: string;
  role?: string;
  start_date?: string;
  end_date?: string;
  summary?: string;
  technologies: string[];
  bullet_points: string[];
  repo_url?: string;
  demo_url?: string;
  is_verified: boolean;
}

export interface SkillItem {
  id: string;
  category: string;
  skill_name: string;
  proficiency_level: string;
  years_experience?: number;
  is_verified: boolean;
}

export interface MasterResume {
  id?: string;
  user_id?: string;
  userId?: string;
  personal_info: ProtectedPersonalInfo;
  personalInfo?: any;
  headline?: string;
  professional_summary?: string;
  professionalSummary?: string;
  educations: ProtectedEducation[];
  experiences: ProtectedExperience[];
  projects: ResumeProject[];
  skills: SkillItem[];
  certifications?: string[];
  achievements?: string[];
  coursework?: string[];
  involvements?: string[];
  section_order?: string[];
  latex_code?: string;
  links?: any[];
  version_number?: number;
  versionNumber?: number;
  raw_text?: string;
  rawText?: string;
}

export interface ResearchSource {
  id: string;
  title: string;
  url: string;
  source_type: string;
  publication_date?: string;
  retrieval_date: string;
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW';
  is_official_company_source: boolean;
  is_observed_pattern: boolean;
  extracted_finding: string;
}

export interface ObservedTechnology {
  name: string;
  frequency_percentage: number;
  category: string;
  is_core_stack: boolean;
  evidence_count: number;
}

export interface ObservedPattern {
  title: string;
  pattern_description: string;
  is_factual_requirement: boolean;
  source_citation?: string;
}

export interface SelectionStage {
  round_number: number;
  stage_name: string;
  description: string;
  source: string;
}

export interface CandidateAlignment {
  fit_percentage: number;
  matched_strengths: string[];
  gap_skills: string[];
  recommended_focus: string;
}

export interface CompanyResearchReport {
  id: string;
  company_name: string;
  job_title?: string;
  is_known_company?: boolean;
  status_message?: string;
  business_model: string;
  products_and_services: string;
  engineering_culture: string;
  hiring_values: string;
  selection_procedure?: SelectionStage[];
  company_requirements?: string[];
  candidate_alignment?: CandidateAlignment;
  observed_tech_stack: ObservedTechnology[];
  observed_employee_patterns: ObservedPattern[];
  sources: ResearchSource[];
  overall_confidence_score: number;
  research_date: string;
  disclaimer: string;
}

export interface JobAnalysisReport {
  job_id: string;
  company_name: string;
  job_title: string;
  role_category: string;
  seniority: string;
  mandatory_skills: string[];
  preferred_skills: string[];
  programming_languages: string[];
  frameworks_and_tools: string[];
  cloud_and_databases: string[];
  domain_knowledge: string[];
  key_responsibilities: string[];
  keywords: string[];
  min_years_experience?: number;
  summary_analysis?: string;
}

export interface CandidateMatchReport {
  id: string;
  overall_match_score: number;
  technical_skill_score: number;
  project_relevance_score: number;
  experience_relevance_score: number;
  education_score: number;
  domain_score: number;
  matched_skills: string[];
  missing_mandatory_skills: string[];
  missing_preferred_skills: string[];
  relevant_projects: {
    project_id: string;
    project_title: string;
    relevance_score: number;
    matched_technologies: string[];
    relevance_explanation: string;
  }[];
  improvement_recommendations: string[];
}

export interface SkillGapItem {
  id: string;
  skill_name: string;
  importance: 'MANDATORY' | 'PREFERRED';
  gap_category: 'A' | 'B' | 'C' | 'D' | 'E';
  explanation: string;
  verification_question?: string;
  user_response?: string;
  is_confirmed_by_user: boolean;
}

export interface SkillGapReport {
  id: string;
  total_gaps_count: number;
  category_counts: Record<string, number>;
  gaps: SkillGapItem[];
  pending_questions: SkillGapItem[];
}

export interface ChangeProposal {
  id: string;
  section_type: string;
  target_id?: string;
  original_content: string;
  proposed_content: string;
  justification_why: string;
  supporting_jd_requirement: string;
  supporting_company_insight?: string;
  expected_benefit: string;
  confidence_level: number;
  evidence_status: string;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EDITED' | 'SAVED_FOR_LATER';
  user_edited_content?: string;
  verification_question?: string;
  user_verification_answer?: string;
}

export interface ATSReport {
  overall_ats_score: number;
  keyword_relevance_score: number;
  readability_score: number;
  section_structure_score: number;
  bullet_quality_score: number;
  formatting_score: number;
  findings: {
    category: string;
    severity: string;
    message: string;
  }[];
  repetition_warnings: string[];
  missing_critical_keywords: string[];
  parsing_compatibility_status: string;
  disclaimer: string;
}

export interface JobApplication {
  id: string;
  companyName: string;
  jobTitle: string;
  status: 'INTERESTED' | 'RESEARCHING' | 'RESUME_READY' | 'APPLIED' | 'ASSESSMENT' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
  applicationDate?: string;
  followUpDate?: string;
  notes?: string;
  portalUrl?: string;
}

export interface DiscoveredJob {
  id: string;
  title: string;
  company: string;
  location: string;
  platform: 'LINKEDIN' | 'NAUKRI';
  jobType: 'JOB' | 'INTERNSHIP';
  experienceLevel: string;
  salaryOrStipend?: string;
  postedDate: string;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  jobUrl: string;
  searchUrl: string;
  naukriUrl?: string;
  linkedinUrl?: string;
  careerPortalUrl?: string;
  descriptionSnippet: string;
  fullJd: string;
  badgeTag?: string;
}
