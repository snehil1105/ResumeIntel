from typing import Dict, Any, List
from app.models.job import (
    JobDescriptionInput, JobAnalysisReport, JobRequirement,
    RequirementCategory, RequirementImportance
)
from app.providers.llm_provider import BaseLLMProvider
import json

class JobDescriptionAnalysisAgent:
    """
    Agent 2: Analyzes job descriptions, decomposes mandatory vs preferred criteria,
    identifies technical taxonomies, tools, frameworks, and domain knowledge.
    """
    def __init__(self, llm_provider: BaseLLMProvider):
        self.llm = llm_provider

    async def analyze(self, jd_input: JobDescriptionInput) -> JobAnalysisReport:
        prompt = f"""
        Analyze this Job Description thoroughly:
        Company: {jd_input.company_name}
        Job Title: {jd_input.job_title}
        Location: {jd_input.location or 'Not specified'}
        Seniority Level: {jd_input.seniority_level or 'Not specified'}

        Job Description Text:
        {jd_input.raw_jd_text}
        """

        schema_description = """
        {
          "role_category": "string (e.g. Backend, Frontend, Full Stack, AI/ML)",
          "seniority": "string (Intern, Entry-Level, Mid-Level, Senior)",
          "mandatory_skills": ["string"],
          "preferred_skills": ["string"],
          "programming_languages": ["string"],
          "frameworks_and_tools": ["string"],
          "cloud_and_databases": ["string"],
          "domain_knowledge": ["string"],
          "key_responsibilities": ["string"],
          "keywords": ["string"],
          "min_years_experience": float,
          "summary_analysis": "string"
        }
        """

        system_prompt = "You are an expert technical recruiting specialist and job description analyst. Accurately separate mandatory requirements from preferred qualifications. Never confuse nice-to-have skills with hard prerequisites."

        result = await self.llm.generate_structured(prompt, schema_description, system_prompt)

        # Build structured requirement models
        structured_requirements = []
        for s in result.get("mandatory_skills", []):
            structured_requirements.append(JobRequirement(
                text=f"Must possess strong proficiency in {s}",
                category=RequirementCategory.LANGUAGE if s in ["Java", "Python", "C++", "Go", "SQL", "TypeScript"] else RequirementCategory.FRAMEWORK,
                importance=RequirementImportance.MANDATORY,
                standardized_skill=s
            ))

        for s in result.get("preferred_skills", []):
            structured_requirements.append(JobRequirement(
                text=f"Preferred familiarity with {s}",
                category=RequirementCategory.CLOUD_INFRA if s in ["AWS", "Docker", "Kubernetes", "GCP"] else RequirementCategory.DEVELOPER_TOOL,
                importance=RequirementImportance.PREFERRED,
                standardized_skill=s
            ))

        return JobAnalysisReport(
            company_name=jd_input.company_name,
            job_title=jd_input.job_title,
            role_category=result.get("role_category", "Software Engineering"),
            seniority=result.get("seniority", jd_input.seniority_level or "Intern / Entry-Level"),
            mandatory_skills=result.get("mandatory_skills", []),
            preferred_skills=result.get("preferred_skills", []),
            programming_languages=result.get("programming_languages", []),
            frameworks_and_tools=result.get("frameworks_and_tools", []),
            cloud_and_databases=result.get("cloud_and_databases", []),
            domain_knowledge=result.get("domain_knowledge", []),
            key_responsibilities=result.get("key_responsibilities", []),
            keywords=result.get("keywords", []),
            min_years_experience=result.get("min_years_experience", 0.0),
            structured_requirements=structured_requirements,
            summary_analysis=result.get("summary_analysis", "Comprehensive requirements breakdown successfully indexed.")
        )
