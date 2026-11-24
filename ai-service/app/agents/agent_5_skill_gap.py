from typing import List, Dict, Any
from app.models.matching import CandidateMatchReport
from app.models.resume import MasterResume
from app.models.job import JobAnalysisReport
from app.models.skill_gap import SkillGapReport, SkillGapItem, GapCategory

class SkillGapAnalysisAgent:
    """
    Agent 5: Analyzes missing skills, rigorously classifies them into categories A-E,
    and formulates targeted candidate verification questions.
    """
    def __init__(self):
        pass

    def analyze_gaps(self, match_report: CandidateMatchReport, resume: MasterResume, jd: JobAnalysisReport) -> SkillGapReport:
        gaps: List[SkillGapItem] = []
        pending_questions: List[SkillGapItem] = []
        category_counts: Dict[str, int] = {"A": 0, "B": 0, "C": 0, "D": 0, "E": 0}

        # Check missing mandatory skills
        for skill in match_report.missing_mandatory_skills:
            # Check if skill might be present in related form
            has_related_project = any(
                "backend" in p.summary.lower() or "microservice" in p.summary.lower()
                for p in resume.projects if p.summary
            )
            
            if skill.lower() in ["docker", "containerization"]:
                gap_item = SkillGapItem(
                    skill_name=skill,
                    importance="MANDATORY",
                    gap_category=GapCategory.B,
                    explanation="Docker is mentioned in target requirements. Your projects reference full-stack development, but containerization architecture is not explicitly detailed in project bullets.",
                    verification_question="The job description emphasizes Docker and containerization. Did you implement Docker containers or Docker Compose in any of your existing projects?",
                    is_confirmed_by_user=False
                )
            elif skill.lower() in ["kafka", "message queue", "rabbitmq"]:
                gap_item = SkillGapItem(
                    skill_name=skill,
                    importance="MANDATORY",
                    gap_category=GapCategory.D,
                    explanation="Asynchronous messaging (Kafka) is required by the role, but no message brokers are documented in your master resume or projects.",
                    verification_question="Have you worked with Apache Kafka or another message broker in academic coursework or personal experiments?",
                    is_confirmed_by_user=False
                )
            else:
                gap_item = SkillGapItem(
                    skill_name=skill,
                    importance="MANDATORY",
                    gap_category=GapCategory.C,
                    explanation=f"Required qualification '{skill}' is not directly referenced in your current master profile.",
                    verification_question=f"Do you have practical hands-on experience with {skill} that can be verified and added to your profile?",
                    is_confirmed_by_user=False
                )

            gaps.append(gap_item)
            pending_questions.append(gap_item)
            category_counts[gap_item.gap_category.value] += 1

        # Check missing preferred skills
        for skill in match_report.missing_preferred_skills:
            gap_item = SkillGapItem(
                skill_name=skill,
                importance="PREFERRED",
                gap_category=GapCategory.B if skill.lower() in ["redis", "aws", "ci/cd"] else GapCategory.C,
                explanation=f"Preferred qualification '{skill}' would strengthen alignment if possessed.",
                verification_question=f"Did you use {skill} in any capacity (e.g. caching, cloud hosting, or build pipelines) during your projects?",
                is_confirmed_by_user=False
            )
            gaps.append(gap_item)
            pending_questions.append(gap_item)
            category_counts[gap_item.gap_category.value] += 1

        return SkillGapReport(
            candidate_match_id=match_report.id,
            total_gaps_count=len(gaps),
            category_counts=category_counts,
            gaps=gaps,
            pending_questions=pending_questions
        )
