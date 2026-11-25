import { jsPDF } from 'jspdf';
import { MasterResume } from '../types';

/**
 * Generates and downloads a genuine, 100% binary ATS-compliant PDF resume
 * with pure typography (Times/Helvetica), proper single-column layout, and correct PDF headers.
 */
export function downloadResumeAsPDF(
  resume: MasterResume,
  companyName: string = 'Company',
  jobTitle: string = ''
): void {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36; // 0.5 inch margins = 36 points
  const contentWidth = pageWidth - margin * 2;
  let y = 42;

  // Helper for automatic page breaks
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Section Header helper
  const drawSectionHeader = (title: string) => {
    checkPageBreak(28);
    y += 6;
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(title.toUpperCase(), margin, y);
    y += 3;
    doc.setDrawColor(40, 40, 40);
    doc.setLineWidth(0.75);
    doc.line(margin, y, margin + contentWidth, y);
    y += 12;
  };

  // 1. Candidate Full Name
  doc.setFont('times', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(10, 10, 10);
  const fullName = (resume.personal_info?.full_name || 'CANDIDATE NAME').toUpperCase();
  doc.text(fullName, pageWidth / 2, y, { align: 'center' });
  y += 16;

  // 2. Contact Header Line
  doc.setFont('times', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const pInfo = resume.personal_info || (resume as any).personalInfo || {};
  const contacts = [
    pInfo.location,
    pInfo.phone,
    pInfo.email,
    pInfo.linkedin_url,
    pInfo.github_url
  ].filter(Boolean);

  if (contacts.length > 0) {
    doc.text(contacts.join('  |  '), pageWidth / 2, y, { align: 'center' });
    y += 14;
  }

  // 3. Education
  const educations = resume.educations || [];
  if (educations.length > 0) {
    drawSectionHeader('Education');
    educations.forEach(edu => {
      checkPageBreak(26);
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(10, 10, 10);
      doc.text(edu.institution_name, margin, y);

      const dates = `${edu.start_date || ''} – ${edu.end_date || ''}`.trim();
      if (dates && dates !== '–') {
        doc.setFont('times', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(dates, margin + contentWidth, y, { align: 'right' });
      }
      y += 12;

      doc.setFont('times', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 30, 30);
      const degreeText = `${edu.degree} in ${edu.field_of_study} ${edu.grade_or_gpa ? `| GPA: ${edu.grade_or_gpa}` : ''}`.trim();
      doc.text(degreeText, margin, y);
      y += 13;
    });
  }

  // 4. Experience (if present)
  const experiences = resume.experiences || [];
  if (experiences.length > 0) {
    drawSectionHeader('Experience');
    experiences.forEach(exp => {
      checkPageBreak(28);
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(10, 10, 10);
      doc.text(`${exp.company_name} — ${exp.job_title}`, margin, y);

      const dates = `${exp.start_date || ''} – ${exp.end_date || ''}`.trim();
      if (dates && dates !== '–') {
        doc.setFont('times', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(dates, margin + contentWidth, y, { align: 'right' });
      }
      y += 12;

      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
      (exp.bullet_points || []).forEach(bp => {
        const lines = doc.splitTextToSize(`•  ${bp}`, contentWidth - 10);
        checkPageBreak(lines.length * 11 + 3);
        doc.text(lines, margin + 8, y);
        y += lines.length * 11 + 2;
      });
      y += 4;
    });
  }

  // 5. Projects
  const projects = resume.projects || [];
  if (projects.length > 0) {
    drawSectionHeader('Projects');
    projects.forEach(proj => {
      checkPageBreak(28);
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(10, 10, 10);

      const techStr = proj.technologies && proj.technologies.length > 0
        ? ` | ${proj.technologies.join(', ')}`
        : '';
      doc.text(proj.title, margin, y);

      if (techStr) {
        const titleWidth = doc.getTextWidth(proj.title);
        doc.setFont('times', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(70, 70, 70);
        doc.text(techStr, margin + titleWidth + 4, y);
      }

      const dateStr = proj.end_date || proj.start_date || '';
      if (dateStr) {
        doc.setFont('times', 'italic');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text(dateStr, margin + contentWidth, y, { align: 'right' });
      }
      y += 13;

      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(30, 30, 30);
      (proj.bullet_points || []).forEach(bp => {
        const lines = doc.splitTextToSize(`•  ${bp}`, contentWidth - 10);
        checkPageBreak(lines.length * 11 + 3);
        doc.text(lines, margin + 8, y);
        y += lines.length * 11 + 2;
      });
      y += 4;
    });
  }

  // 6. Skills
  const skills = resume.skills || [];
  if (skills.length > 0) {
    drawSectionHeader('Technical Skills');
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);

    const categories: Record<string, string[]> = {};
    skills.forEach((s: any) => {
      const cat = s.category || 'Technologies';
      const name = s.skill_name || s.name || s;
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
    });

    Object.entries(categories).forEach(([cat, sList]) => {
      checkPageBreak(14);
      doc.setFont('times', 'bold');
      doc.text(`${cat}: `, margin, y);
      const catWidth = doc.getTextWidth(`${cat}: `);

      doc.setFont('times', 'normal');
      const lines = doc.splitTextToSize(sList.join(', '), contentWidth - catWidth);
      doc.text(lines, margin + catWidth, y);
      y += lines.length * 11 + 3;
    });
  }

  // 7. Coursework
  const coursework = resume.coursework || [];
  if (coursework.length > 0) {
    drawSectionHeader('Coursework & Certifications');
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    coursework.forEach(cw => {
      const lines = doc.splitTextToSize(`•  ${cw}`, contentWidth - 10);
      checkPageBreak(lines.length * 11 + 3);
      doc.text(lines, margin + 8, y);
      y += lines.length * 11 + 2;
    });
  }

  // 8. Involvements
  const involvements = resume.involvements || [];
  if (involvements.length > 0) {
    drawSectionHeader('Involvement & Extracurriculars');
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 30);
    involvements.forEach(inv => {
      const lines = doc.splitTextToSize(`•  ${inv}`, contentWidth - 10);
      checkPageBreak(lines.length * 11 + 3);
      doc.text(lines, margin + 8, y);
      y += lines.length * 11 + 2;
    });
  }

  // Save the real binary PDF
  const safeName = (resume.personal_info?.full_name || 'Resume').replace(/\s+/g, '_');
  const safeCompany = (companyName || 'Target').replace(/\s+/g, '_');
  doc.save(`Resume_${safeName}_${safeCompany}.pdf`);
}
