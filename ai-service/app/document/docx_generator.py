import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from app.models.resume import MasterResume

class ATSDOCXGenerator:
    """
    Generates ATS-optimized DOCX resumes.
    Strictly uses clean single-column structure with standard Word styles.
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
        doc = docx.Document()

        # Set 0.5 inch margins
        for section in doc.sections:
            section.top_margin = Inches(0.5)
            section.bottom_margin = Inches(0.5)
            section.left_margin = Inches(0.5)
            section.right_margin = Inches(0.5)

        # Name
        pi = resume.personal_info
        p_name = doc.add_paragraph()
        p_name.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run_name = p_name.add_run(pi.full_name)
        run_name.font.size = Pt(18)
        run_name.font.bold = True
        run_name.font.name = 'Calibri'
        run_name.font.color.rgb = RGBColor(26, 32, 44)

        # Contact Info
        p_contact = doc.add_paragraph()
        p_contact.alignment = WD_ALIGN_PARAGRAPH.CENTER
        contact_items = [item for item in [pi.email, pi.phone, pi.location, pi.linkedin_url, pi.github_url] if item]
        run_contact = p_contact.add_run(" | ".join(contact_items))
        run_contact.font.size = Pt(10)
        run_contact.font.name = 'Calibri'
        run_contact.font.color.rgb = RGBColor(74, 85, 104)

        def add_heading(text: str):
            h = doc.add_paragraph()
            h.paragraph_format.space_before = Pt(8)
            h.paragraph_format.space_after = Pt(2)
            run = h.add_run(text.upper())
            run.font.size = Pt(11.5)
            run.font.bold = True
            run.font.name = 'Calibri'
            run.font.color.rgb = RGBColor(43, 108, 176)

        # Professional Summary
        if resume.professional_summary:
            add_heading("Professional Summary")
            p = doc.add_paragraph(resume.professional_summary)
            p.paragraph_format.space_after = Pt(4)

        # Technical Skills
        if resume.skills:
            add_heading("Technical Skills")
            categories = {}
            for s in resume.skills:
                cat = s.category or "General"
                categories.setdefault(cat, []).append(s.skill_name)
            for cat, items in categories.items():
                p = doc.add_paragraph()
                r1 = p.add_run(f"{cat}: ")
                r1.bold = True
                p.add_run(", ".join(items))
                p.paragraph_format.space_after = Pt(2)

        # Projects
        if resume.projects:
            add_heading("Technical Projects")
            for proj in resume.projects:
                p = doc.add_paragraph()
                r_title = p.add_run(proj.title)
                r_title.bold = True
                if proj.technologies:
                    r_tech = p.add_run(f" | {', '.join(proj.technologies)}")
                    r_tech.italic = True
                if proj.summary:
                    p_sum = doc.add_paragraph(proj.summary)
                    p_sum.paragraph_format.space_after = Pt(2)
                for b in proj.bullet_points:
                    bp = doc.add_paragraph(b, style='List Bullet')
                    bp.paragraph_format.space_after = Pt(1)

        # Experience
        if resume.experiences:
            add_heading("Work Experience")
            for exp in resume.experiences:
                p = doc.add_paragraph()
                r_co = p.add_run(f"{exp.company_name} – {exp.job_title}")
                r_co.bold = True
                p.add_run(f" ({exp.start_date} – {exp.end_date or 'Present'})")
                for b in exp.bullet_points:
                    bp = doc.add_paragraph(b, style='List Bullet')
                    bp.paragraph_format.space_after = Pt(1)

        # Education (Protected)
        if resume.educations:
            add_heading("Education")
            for edu in resume.educations:
                p = doc.add_paragraph()
                r_inst = p.add_run(edu.institution_name)
                r_inst.bold = True
                if edu.start_date:
                    p.add_run(f" ({edu.start_date} – {edu.end_date})")
                gpa = f" | GPA: {edu.grade_or_gpa}" if edu.grade_or_gpa else ""
                p_deg = doc.add_paragraph(f"{edu.degree} in {edu.field_of_study or ''}{gpa}")
                p_deg.paragraph_format.space_after = Pt(2)

        # Footer
        p_footer = doc.add_paragraph()
        p_footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_footer.paragraph_format.space_before = Pt(12)
        rf = p_footer.add_run(f"Tailored for {company_name} ({job_title}) | Version {version_number}")
        rf.font.size = Pt(8)
        rf.font.italic = True
        rf.font.color.rgb = RGBColor(160, 174, 192)

        doc.save(output_path)
        return output_path
