import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.units import inch
from app.models.resume import MasterResume

class ATSPDFGenerator:
    """
    Generates ATS-optimized single-column PDF resumes.
    Strictly uses clean text hierarchies without multi-column tables, graphics,
    or non-standard glyphs that disrupt ATS parsers.
    """
    @staticmethod
    def generate(
        resume: MasterResume,
        output_path: str,
        company_name: str = "Company",
        job_title: str = "Software Engineer",
        version_number: int = 1
    ) -> str:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            leftMargin=0.5 * inch,
            rightMargin=0.5 * inch,
            topMargin=0.5 * inch,
            bottomMargin=0.5 * inch
        )

        styles = getSampleStyleSheet()

        # Custom ATS Typography Styles
        name_style = ParagraphStyle(
            'ATS_Name',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            alignment=1, # Center
            textColor=colors.HexColor("#1A202C")
        )
        
        contact_style = ParagraphStyle(
            'ATS_Contact',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13,
            alignment=1, # Center
            textColor=colors.HexColor("#4A5568")
        )

        section_heading_style = ParagraphStyle(
            'ATS_SectionHeading',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=11.5,
            leading=16,
            textColor=colors.HexColor("#2B6CB0"),
            spaceBefore=8,
            spaceAfter=4,
            keepWithNext=True
        )

        subheading_style = ParagraphStyle(
            'ATS_Subheading',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            leading=13,
            textColor=colors.HexColor("#2D3748")
        )

        body_style = ParagraphStyle(
            'ATS_Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor("#2D3748")
        )

        bullet_style = ParagraphStyle(
            'ATS_Bullet',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=13,
            leftIndent=15,
            firstLineIndent=-10,
            textColor=colors.HexColor("#2D3748")
        )

        meta_footer_style = ParagraphStyle(
            'ATS_Footer',
            parent=styles['Normal'],
            fontName='Helvetica-Oblique',
            fontSize=7.5,
            leading=9,
            alignment=1,
            textColor=colors.HexColor("#A0AEC0")
        )

        story = []

        # 1. Header (Name & Contact)
        pi = resume.personal_info
        story.append(Paragraph(pi.full_name, name_style))
        story.append(Spacer(1, 3))
        
        contact_parts = []
        if pi.email:
            contact_parts.append(pi.email)
        if pi.phone:
            contact_parts.append(pi.phone)
        if pi.location:
            contact_parts.append(pi.location)
        if pi.linkedin_url:
            contact_parts.append(f'<a href="{pi.linkedin_url}" color="#2B6CB0">LinkedIn</a>')
        if pi.github_url:
            contact_parts.append(f'<a href="{pi.github_url}" color="#2B6CB0">GitHub</a>')

        story.append(Paragraph(" | ".join(contact_parts), contact_style))
        story.append(Spacer(1, 6))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E0"), spaceAfter=8))

        # 2. Professional Summary
        if resume.professional_summary:
            story.append(Paragraph("PROFESSIONAL SUMMARY", section_heading_style))
            story.append(Paragraph(resume.professional_summary, body_style))
            story.append(Spacer(1, 6))

        # 3. Technical Skills
        if resume.skills:
            story.append(Paragraph("TECHNICAL SKILLS", section_heading_style))
            # Group by category
            categories = {}
            for s in resume.skills:
                cat = s.category or "General"
                categories.setdefault(cat, []).append(s.skill_name)
            
            for cat, items in categories.items():
                line = f"<b>{cat}:</b> {', '.join(items)}"
                story.append(Paragraph(line, body_style))
            story.append(Spacer(1, 6))

        # 4. Projects
        if resume.projects:
            story.append(Paragraph("TECHNICAL PROJECTS", section_heading_style))
            for proj in resume.projects:
                tech_str = f" | <i>{', '.join(proj.technologies)}</i>" if proj.technologies else ""
                story.append(Paragraph(f"<b>{proj.title}</b>{tech_str}", subheading_style))
                if proj.summary:
                    story.append(Paragraph(proj.summary, body_style))
                for b in proj.bullet_points:
                    story.append(Paragraph(f"• {b}", bullet_style))
                story.append(Spacer(1, 4))
            story.append(Spacer(1, 4))

        # 5. Experience
        if resume.experiences:
            story.append(Paragraph("WORK EXPERIENCE", section_heading_style))
            for exp in resume.experiences:
                dates = f" ({exp.start_date} – {exp.end_date or 'Present'})"
                story.append(Paragraph(f"<b>{exp.company_name}</b> – {exp.job_title}{dates}", subheading_style))
                for b in exp.bullet_points:
                    story.append(Paragraph(f"• {b}", bullet_style))
                story.append(Spacer(1, 4))
            story.append(Spacer(1, 4))

        # 6. Education (Protected)
        if resume.educations:
            story.append(Paragraph("EDUCATION", section_heading_style))
            for edu in resume.educations:
                dates = f" ({edu.start_date} – {edu.end_date})" if edu.start_date else ""
                gpa_str = f" | GPA: {edu.grade_or_gpa}" if edu.grade_or_gpa else ""
                story.append(Paragraph(f"<b>{edu.institution_name}</b>{dates}", subheading_style))
                story.append(Paragraph(f"{edu.degree} in {edu.field_of_study or ''}{gpa_str}", body_style))
                story.append(Spacer(1, 3))
            story.append(Spacer(1, 6))

        # Footer Version Tagging
        story.append(Spacer(1, 8))
        story.append(Paragraph(f"Tailored for {company_name} ({job_title}) | Version {version_number} | ATS-Optimized Single Column", meta_footer_style))

        doc.build(story)
        return output_path
