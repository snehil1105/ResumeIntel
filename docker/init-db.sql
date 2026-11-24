-- =========================================================================
-- ResumeIntel AI - Database Schema Initialization Script
-- PostgreSQL 16+ with pgvector extension
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Clean teardown if needed (for fresh init)
-- DROP TABLE IF EXISTS agent_execution_logs CASCADE;
-- DROP TABLE IF EXISTS generated_documents CASCADE;
-- DROP TABLE IF EXISTS application_status_history CASCADE;
-- DROP TABLE IF EXISTS job_applications CASCADE;
-- DROP TABLE IF EXISTS ats_reports CASCADE;
-- DROP TABLE IF EXISTS resume_versions CASCADE;
-- DROP TABLE IF EXISTS change_approvals CASCADE;
-- DROP TABLE IF EXISTS resume_change_proposals CASCADE;
-- DROP TABLE IF EXISTS skill_gaps CASCADE;
-- DROP TABLE IF EXISTS candidate_matches CASCADE;
-- DROP TABLE IF EXISTS research_sources CASCADE;
-- DROP TABLE IF EXISTS company_research CASCADE;
-- DROP TABLE IF EXISTS job_analyses CASCADE;
-- DROP TABLE IF EXISTS job_descriptions CASCADE;
-- DROP TABLE IF EXISTS resume_skills CASCADE;
-- DROP TABLE IF EXISTS resume_projects CASCADE;
-- DROP TABLE IF EXISTS resume_educations CASCADE;
-- DROP TABLE IF EXISTS resume_experiences CASCADE;
-- DROP TABLE IF EXISTS resume_sections CASCADE;
-- DROP TABLE IF EXISTS master_resumes CASCADE;
-- DROP TABLE IF EXISTS resume_embeddings CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_USER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Master Resumes (The Single Source of Truth with Protected Fields)
CREATE TABLE IF NOT EXISTS master_resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- PROTECTED IMMUTABLE IDENTITY FIELDS (Locked against AI mutation)
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(255),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    -- EDITABLE PROFESSIONAL SECTIONS
    professional_summary TEXT,
    headline VARCHAR(300),
    version_number INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    raw_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_master_resumes_user ON master_resumes(user_id);

-- 3. Resume Sections (Generic ordered blocks)
CREATE TABLE IF NOT EXISTS resume_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_resume_id UUID NOT NULL REFERENCES master_resumes(id) ON DELETE CASCADE,
    section_type VARCHAR(100) NOT NULL, -- SUMMARY, SKILLS, EXPERIENCE, PROJECTS, EDUCATION, CERTIFICATIONS, AWARDS
    title VARCHAR(255) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sections_resume ON resume_sections(master_resume_id);

-- 4. Resume Educations (PROTECTED IMMUTABLE ACADEMIC RECORD)
CREATE TABLE IF NOT EXISTS resume_educations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_resume_id UUID NOT NULL REFERENCES master_resumes(id) ON DELETE CASCADE,
    institution_name VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    field_of_study VARCHAR(255),
    grade_or_gpa VARCHAR(50),
    start_date VARCHAR(50),
    end_date VARCHAR(50),
    location VARCHAR(255),
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_educations_resume ON resume_educations(master_resume_id);

-- 5. Resume Experiences (PROTECTED IMMUTABLE EMPLOYMENT CHRONOLOGY)
CREATE TABLE IF NOT EXISTS resume_experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_resume_id UUID NOT NULL REFERENCES master_resumes(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    start_date VARCHAR(50) NOT NULL,
    end_date VARCHAR(50),
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    bullet_points JSONB DEFAULT '[]'::jsonb,
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_experiences_resume ON resume_experiences(master_resume_id);

-- 6. Resume Projects (Verified Candidate Achievements)
CREATE TABLE IF NOT EXISTS resume_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_resume_id UUID NOT NULL REFERENCES master_resumes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    start_date VARCHAR(50),
    end_date VARCHAR(50),
    summary TEXT,
    technologies JSONB DEFAULT '[]'::jsonb,
    bullet_points JSONB DEFAULT '[]'::jsonb,
    repo_url VARCHAR(500),
    demo_url VARCHAR(500),
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_resume ON resume_projects(master_resume_id);

-- 7. Resume Skills (Verified Skills Taxonomy)
CREATE TABLE IF NOT EXISTS resume_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_resume_id UUID NOT NULL REFERENCES master_resumes(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- Languages, Frameworks, Cloud, Databases, Tools
    skill_name VARCHAR(150) NOT NULL,
    proficiency_level VARCHAR(50) DEFAULT 'INTERMEDIATE', -- BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    years_experience NUMERIC(4, 1),
    is_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_skills_resume ON resume_skills(master_resume_id);
CREATE INDEX IF NOT EXISTS idx_skills_name ON resume_skills(LOWER(skill_name));

-- 8. Job Descriptions (Submissions to be Analyzed)
CREATE TABLE IF NOT EXISTS job_descriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    job_url VARCHAR(1000),
    location VARCHAR(255),
    seniority_level VARCHAR(100), -- Intern, Entry, Mid, Senior, Lead
    raw_jd_text TEXT NOT NULL,
    additional_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jds_user ON job_descriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_jds_company ON job_descriptions(company_name);

-- 9. Job Analyses (Structured JD Breakdown by Agent 2)
CREATE TABLE IF NOT EXISTS job_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_description_id UUID NOT NULL UNIQUE REFERENCES job_descriptions(id) ON DELETE CASCADE,
    role_category VARCHAR(150),
    seniority VARCHAR(100),
    required_qualifications JSONB DEFAULT '[]'::jsonb,
    preferred_qualifications JSONB DEFAULT '[]'::jsonb,
    technical_skills JSONB DEFAULT '[]'::jsonb,
    programming_languages JSONB DEFAULT '[]'::jsonb,
    frameworks_and_tools JSONB DEFAULT '[]'::jsonb,
    domain_knowledge JSONB DEFAULT '[]'::jsonb,
    key_responsibilities JSONB DEFAULT '[]'::jsonb,
    keywords JSONB DEFAULT '[]'::jsonb,
    min_years_experience NUMERIC(4,1),
    is_parsed BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Company Research (Market & Engineering Intelligence by Agent 3)
CREATE TABLE IF NOT EXISTS company_research (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_description_id UUID NOT NULL REFERENCES job_descriptions(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    business_model TEXT,
    products_and_services TEXT,
    engineering_culture TEXT,
    hiring_values TEXT,
    observed_tech_stack JSONB DEFAULT '[]'::jsonb,
    observed_employee_patterns JSONB DEFAULT '[]'::jsonb,
    overall_confidence_score NUMERIC(3, 2), -- 0.00 to 1.00
    retrieval_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_research_company ON company_research(company_name);

-- 11. Research Sources (Verifiable Citations)
CREATE TABLE IF NOT EXISTS research_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_research_id UUID NOT NULL REFERENCES company_research(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    url VARCHAR(1500) NOT NULL,
    source_type VARCHAR(100) NOT NULL, -- OFFICIAL_CAREERS, ENGINEERING_BLOG, PUBLIC_FILING, TECH_ARTICLE
    publication_date VARCHAR(100),
    retrieval_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confidence_level VARCHAR(50) DEFAULT 'HIGH', -- HIGH, MEDIUM, LOW
    is_official_company_source BOOLEAN DEFAULT FALSE,
    is_observed_pattern BOOLEAN DEFAULT TRUE,
    extracted_finding TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sources_research ON research_sources(company_research_id);

-- 12. Candidate Matches (Scoring Matrix by Agent 4)
CREATE TABLE IF NOT EXISTS candidate_matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    master_resume_id UUID NOT NULL REFERENCES master_resumes(id) ON DELETE CASCADE,
    job_analysis_id UUID NOT NULL REFERENCES job_analyses(id) ON DELETE CASCADE,
    overall_match_score NUMERIC(5, 2) NOT NULL, -- 0.00 to 100.00
    technical_skill_score NUMERIC(5, 2),
    project_relevance_score NUMERIC(5, 2),
    experience_relevance_score NUMERIC(5, 2),
    education_score NUMERIC(5, 2),
    domain_score NUMERIC(5, 2),
    matched_skills JSONB DEFAULT '[]'::jsonb,
    missing_mandatory_skills JSONB DEFAULT '[]'::jsonb,
    missing_preferred_skills JSONB DEFAULT '[]'::jsonb,
    relevant_projects JSONB DEFAULT '[]'::jsonb,
    irrelevant_content JSONB DEFAULT '[]'::jsonb,
    underrepresented_achievements JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Skill Gaps & Verification Questions (Agent 5)
CREATE TABLE IF NOT EXISTS skill_gaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_match_id UUID NOT NULL REFERENCES candidate_matches(id) ON DELETE CASCADE,
    skill_name VARCHAR(150) NOT NULL,
    importance VARCHAR(50) NOT NULL DEFAULT 'MANDATORY', -- MANDATORY, PREFERRED, NICE_TO_HAVE
    gap_category VARCHAR(10) NOT NULL, -- A, B, C, D, E
    -- A: Already possessed but missing from resume
    -- B: Possessed but insufficiently demonstrated
    -- C: Partially familiar
    -- D: Not possessed
    -- E: Not applicable
    explanation TEXT,
    verification_question TEXT,
    user_response TEXT,
    is_confirmed_by_user BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gaps_match ON skill_gaps(candidate_match_id);

-- 14. Resume Change Proposals (Agent 6 & 7 Recommendations)
CREATE TABLE IF NOT EXISTS resume_change_proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_match_id UUID NOT NULL REFERENCES candidate_matches(id) ON DELETE CASCADE,
    section_type VARCHAR(100) NOT NULL, -- SUMMARY, SKILLS_ORDER, PROJECT_BULLET, PROJECT_TITLE, ACHIEVEMENT
    target_id VARCHAR(255), -- ID of project/skill or section
    original_content TEXT NOT NULL,
    proposed_content TEXT NOT NULL,
    justification_why TEXT NOT NULL,
    supporting_jd_requirement TEXT,
    supporting_company_insight TEXT,
    expected_benefit TEXT,
    confidence_level NUMERIC(3, 2) DEFAULT 0.85,
    evidence_status VARCHAR(100) DEFAULT 'VERIFIED_FROM_MASTER', -- VERIFIED_FROM_MASTER, USER_CONFIRMED, SPECULATIVE_FLAGGED
    approval_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, EDITED
    user_edited_content TEXT,
    verification_question TEXT,
    user_verification_answer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_proposals_match ON resume_change_proposals(candidate_match_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON resume_change_proposals(approval_status);

-- 15. Change Approvals (Audit Trail of User Decisions)
CREATE TABLE IF NOT EXISTS change_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES resume_change_proposals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- APPROVED, REJECTED, EDITED, SAVED_FOR_LATER
    previous_content TEXT,
    final_content TEXT,
    notes TEXT,
    decided_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Resume Versions (Company & Role Specific Resumes)
CREATE TABLE IF NOT EXISTS resume_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    master_resume_id UUID NOT NULL REFERENCES master_resumes(id) ON DELETE CASCADE,
    job_description_id UUID NOT NULL REFERENCES job_descriptions(id) ON DELETE CASCADE,
    version_tag VARCHAR(150) NOT NULL, -- e.g. "Google - Backend Intern - v1"
    version_number INTEGER NOT NULL DEFAULT 1,
    customized_content JSONB NOT NULL, -- Complete ATS-friendly structured JSON
    ats_heuristic_score INTEGER,
    human_reviewed BOOLEAN NOT NULL DEFAULT TRUE,
    pdf_path VARCHAR(1000),
    docx_path VARCHAR(1000),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_versions_user ON resume_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_versions_job ON resume_versions(job_description_id);

-- 17. ATS Reports (Agent 8 Heuristic Evaluations)
CREATE TABLE IF NOT EXISTS ats_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_version_id UUID NOT NULL UNIQUE REFERENCES resume_versions(id) ON DELETE CASCADE,
    overall_ats_score INTEGER NOT NULL, -- 0 to 100
    keyword_relevance_score INTEGER,
    readability_score INTEGER,
    section_structure_score INTEGER,
    bullet_quality_score INTEGER,
    formatting_score INTEGER,
    findings JSONB DEFAULT '[]'::jsonb,
    repetition_warnings JSONB DEFAULT '[]'::jsonb,
    missing_critical_keywords JSONB DEFAULT '[]'::jsonb,
    parsing_compatibility_status VARCHAR(50) DEFAULT 'PASS',
    disclaimer TEXT NOT NULL DEFAULT 'This score is an internal heuristic indicator for structure, relevance and parsing compatibility. It does not represent an actual hiring system score or guarantee employment.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Job Applications (Application Tracker & Kanban)
CREATE TABLE IF NOT EXISTS job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_description_id UUID NOT NULL REFERENCES job_descriptions(id) ON DELETE CASCADE,
    resume_version_id UUID REFERENCES resume_versions(id) ON DELETE SET NULL,
    company_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'INTERESTED', 
    -- INTERESTED, RESEARCHING, RESUME_READY, APPLIED, ASSESSMENT, INTERVIEW, REJECTED, SELECTED
    application_date DATE,
    follow_up_date DATE,
    portal_url VARCHAR(1000),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_apps_user ON job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_apps_status ON job_applications(status);

-- 19. Application Status History (Timeline tracking)
CREATE TABLE IF NOT EXISTS application_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- 20. Generated Documents (PDF / DOCX File Registry)
CREATE TABLE IF NOT EXISTS generated_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_version_id UUID NOT NULL REFERENCES resume_versions(id) ON DELETE CASCADE,
    document_type VARCHAR(20) NOT NULL, -- PDF, DOCX
    file_path VARCHAR(1000) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT,
    page_count INTEGER DEFAULT 1,
    layout_style VARCHAR(50) DEFAULT 'COMPACT_SINGLE_COLUMN', -- COMPACT_SINGLE_COLUMN, DETAILED_SINGLE_COLUMN
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 21. Agent Execution Logs (Audit & Observability for Multi-Agent Workflow)
CREATE TABLE IF NOT EXISTS agent_execution_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id VARCHAR(100) NOT NULL,
    agent_name VARCHAR(100) NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    execution_status VARCHAR(50) NOT NULL, -- STARTED, COMPLETED, FAILED, INTERRUPTED_HITL
    input_summary JSONB,
    output_summary JSONB,
    execution_time_ms BIGINT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_logs_workflow ON agent_execution_logs(workflow_id);

-- 22. Resume Vector Embeddings (RAG Semantic Store via pgvector)
CREATE TABLE IF NOT EXISTS resume_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_type VARCHAR(50) NOT NULL, -- MASTER_PROJECT, MASTER_EXPERIENCE, SKILL_ITEM, RESEARCH_SNIPPET, JD_REQUIREMENT
    source_id UUID,
    chunk_text TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    embedding vector(1536), -- Standard embedding dimension (OpenAI 1536 or Gemini 768/1536)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_embeddings_user ON resume_embeddings(user_id);
-- Approximate nearest neighbor index using cosine distance
CREATE INDEX IF NOT EXISTS idx_embeddings_vec ON resume_embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
