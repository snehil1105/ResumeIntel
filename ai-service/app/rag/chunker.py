from typing import List, Dict, Any
from app.models.resume import MasterResume

class ResumeChunker:
    """Decomposes structured resume into semantic chunks tagged with tenant user_id."""
    @staticmethod
    def chunk_master_resume(resume: MasterResume) -> List[Dict[str, Any]]:
        chunks = []
        
        # Summary Chunk
        if resume.professional_summary:
            chunks.append({
                "source_type": "SUMMARY",
                "source_id": resume.id,
                "user_id": resume.user_id,
                "chunk_text": f"Professional Summary: {resume.professional_summary}",
                "metadata": {"section": "summary", "user_id": resume.user_id}
            })

        # Project Chunks
        for proj in resume.projects:
            bullets_text = " ".join(proj.bullet_points)
            tech_text = ", ".join(proj.technologies)
            chunk_content = f"Project: {proj.title}. Technologies: {tech_text}. Summary: {proj.summary or ''}. Details: {bullets_text}"
            chunks.append({
                "source_type": "PROJECT",
                "source_id": proj.id,
                "user_id": resume.user_id,
                "chunk_text": chunk_content,
                "metadata": {
                    "section": "project",
                    "project_title": proj.title,
                    "technologies": proj.technologies,
                    "user_id": resume.user_id
                }
            })

        # Experience Chunks
        for exp in resume.experiences:
            bullets_text = " ".join(exp.bullet_points)
            chunk_content = f"Experience at {exp.company_name} as {exp.job_title} ({exp.start_date} - {exp.end_date}): {bullets_text}"
            chunks.append({
                "source_type": "EXPERIENCE",
                "source_id": exp.id,
                "user_id": resume.user_id,
                "chunk_text": chunk_content,
                "metadata": {
                    "section": "experience",
                    "company": exp.company_name,
                    "user_id": resume.user_id
                }
            })

        # Skills Chunk
        if resume.skills:
            all_skills = ", ".join([f"{s.skill_name} ({s.category})" for s in resume.skills])
            chunks.append({
                "source_type": "SKILLS",
                "source_id": resume.id,
                "user_id": resume.user_id,
                "chunk_text": f"Technical Skills: {all_skills}",
                "metadata": {"section": "skills", "user_id": resume.user_id}
            })

        return chunks
