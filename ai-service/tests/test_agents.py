import pytest
import asyncio
from app.agents.agent_1_resume_intelligence import ResumeIntelligenceAgent
from app.agents.agent_2_jd_analysis import JobDescriptionAnalysisAgent
from app.agents.agent_3_company_research import CompanyIntelligenceResearchAgent
from app.agents.agent_4_matching import CandidateJobMatchingAgent
from app.agents.agent_5_skill_gap import SkillGapAnalysisAgent
from app.agents.agent_6_project_optimization import ProjectOptimizationAgent
from app.agents.agent_7_customization import ResumeCustomizationAgent
from app.agents.agent_8_ats_evaluator import ATSOptimizationAgent
from app.agents.agent_9_quality_reviewer import ResumeQualityReviewerAgent
from app.models.job import JobDescriptionInput
from app.models.proposals import ApprovalStatus
from app.providers.llm_provider import MockDeterministicLLMProvider
from app.providers.search_provider import CuratedCompanyKnowledgebaseProvider

@pytest.fixture
def mock_llm():
    return MockDeterministicLLMProvider()

@pytest.fixture
def mock_search():
    return CuratedCompanyKnowledgebaseProvider()

@pytest.fixture
def sample_resume():
    agent1 = ResumeIntelligenceAgent()
    sample_text = """
    Alex Mercer
    alex.mercer@cs.edu | (555) 234-5678 | San Francisco, CA
    linkedin.com/in/alex-mercer | github.com/alex-mercer
    
    Education:
    Bachelor of Science in Computer Science, State Tech University (2022 - 2026), GPA: 3.9/4.0
    
    Experience:
    Apex Software Labs - Backend Developer Intern (May 2024 - August 2024)
    - Developed scalable REST APIs using Java and Spring Boot.
    - Optimized relational database queries in PostgreSQL.
    
    Projects:
    Distributed E-Commerce Platform
    - Architected modular microservices using Spring Boot and Hibernate with PostgreSQL datastores.
    - Designed secure RESTful API endpoints for catalog search and payment transaction management.
    - Dockerized backend and database services to ensure reproducible local development environments.
    """
    return agent1.extract_from_raw_text(sample_text, user_id="user-123")

@pytest.mark.asyncio
async def test_agent1_resume_extraction_and_immutability(sample_resume):
    assert sample_resume.personal_info.full_name == "Alex Mercer"
    assert sample_resume.personal_info.email == "alex.mercer@cs.edu"
    assert len(sample_resume.educations) >= 1
    assert sample_resume.educations[0].is_verified is True
    assert len(sample_resume.projects) >= 1
    
    # Snapshot integrity test
    protected_dict = sample_resume.get_protected_field_values()
    assert "personal_info" in protected_dict
    assert protected_dict["personal_info"]["full_name"] == "Alex Mercer"

@pytest.mark.asyncio
async def test_agent2_jd_analysis(mock_llm):
    agent2 = JobDescriptionAnalysisAgent(mock_llm)
    jd_input = JobDescriptionInput(
        company_name="Google",
        job_title="Software Engineering Intern - Backend",
        raw_jd_text="Looking for a backend intern proficient in Java, Spring Boot, REST APIs, and SQL. Familiarity with Docker and Kubernetes is preferred."
    )
    report = await agent2.analyze(jd_input)
    assert report.company_name == "Google"
    assert "Java" in report.mandatory_skills
    assert "Docker" in report.preferred_skills or "Kubernetes" in report.preferred_skills

@pytest.mark.asyncio
async def test_agent3_company_research(mock_search):
    agent3 = CompanyIntelligenceResearchAgent(mock_search)
    research = await agent3.research("Google", "Backend Intern")
    assert research.company_name == "Google"
    assert len(research.sources) > 0
    # Every source must have verifiable URL and confidence
    for source in research.sources:
        assert source.url.startswith("http")
        assert source.extracted_finding is not None
        assert source.confidence_level is not None

@pytest.mark.asyncio
async def test_agent4_matching_and_factual_honesty(sample_resume, mock_llm):
    agent2 = JobDescriptionAnalysisAgent(mock_llm)
    jd_report = await agent2.analyze(JobDescriptionInput(
        company_name="Google",
        job_title="Backend Intern",
        raw_jd_text="Requirements: Java, Spring Boot, SQL, Git, Docker, Kafka"
    ))
    agent4 = CandidateJobMatchingAgent()
    company_report = await CompanyIntelligenceResearchAgent(CuratedCompanyKnowledgebaseProvider()).research("Google", "Backend Intern")
    
    match = agent4.match(sample_resume, jd_report, company_report)
    assert match.overall_match_score > 0
    assert "Java" in match.matched_skills
    # Kafka is not in master resume, so it MUST NOT be marked as matched
    assert "Kafka" not in match.matched_skills

@pytest.mark.asyncio
async def test_agent5_skill_gap_classification(sample_resume, mock_llm):
    agent2 = JobDescriptionAnalysisAgent(mock_llm)
    jd_report = await agent2.analyze(JobDescriptionInput(
        company_name="Google",
        job_title="Backend Intern",
        raw_jd_text="Requirements: Java, Spring Boot, Docker, Kafka"
    ))
    agent4 = CandidateJobMatchingAgent()
    company_report = await CompanyIntelligenceResearchAgent(CuratedCompanyKnowledgebaseProvider()).research("Google", "Backend Intern")
    match = agent4.match(sample_resume, jd_report, company_report)
    
    agent5 = SkillGapAnalysisAgent()
    gaps = agent5.analyze_gaps(match, sample_resume, jd_report)
    assert gaps.total_gaps_count >= 1
    # Check verification question formulation
    for q in gaps.pending_questions:
        assert "?" in q.verification_question

@pytest.mark.asyncio
async def test_agent8_ats_evaluator(sample_resume, mock_llm):
    agent2 = JobDescriptionAnalysisAgent(mock_llm)
    jd_report = await agent2.analyze(JobDescriptionInput(
        company_name="Google",
        job_title="Backend Intern",
        raw_jd_text="Java Spring Boot SQL"
    ))
    agent8 = ATSOptimizationAgent()
    report = agent8.evaluate(sample_resume, jd_report)
    assert 0 <= report.overall_ats_score <= 100
    assert "heuristic" in report.disclaimer.lower()

@pytest.mark.asyncio
async def test_agent9_quality_reviewer_immutability_violation_catch(sample_resume):
    agent9 = ResumeQualityReviewerAgent()
    import copy
    tampered_resume = copy.deepcopy(sample_resume)
    
    # Intentionally violate immutability by altering candidate degree
    tampered_resume.educations[0].degree = "Ph.D. in Artificial Intelligence"
    
    is_valid, violations = agent9.review(sample_resume, tampered_resume, [])
    assert is_valid is False
    assert any("IMMUTABILITY VIOLATION" in v for v in violations)
