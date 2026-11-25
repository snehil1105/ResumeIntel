import { jsPDF } from 'jspdf';
import { MasterResume } from '../types';

/**
 * Generates and downloads a genuine, 100% binary ATS-compliant PDF resume
 * with pure typography (Times), proper single-column layout, and active clickable hyperlinks.
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
  let y = 38;

  // Helper for automatic page breaks
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // Section Header helper (matching Jake's resume horizontal line style)
  const drawSectionHeader = (title: string) => {
    checkPageBreak(26);
    y += 5;
    doc.setFont('times', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(title.toUpperCase(), margin, y);
    y += 3;
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.75);
    doc.line(margin, y, margin + contentWidth, y);
    y += 11;
  };

  const pInfo: any = resume.personal_info || (resume as any).personalInfo || {};

  // 1. Candidate Full Name
  doc.setFont('times', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(15, 23, 42);
  const fullName = (pInfo.full_name || pInfo.fullName || 'Candidate Name').toUpperCase();
  doc.text(fullName, pageWidth / 2, y, { align: 'center' });
  y += 14;

  // 2. Location (Guard: Never duplicate candidate name)
  const loc = (pInfo.location && pInfo.location.toLowerCase() !== fullName.toLowerCase())
    ? pInfo.location
    : '';
  if (loc) {
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(loc, pageWidth / 2, y, { align: 'center' });
    y += 12;
  }

  // 3. Contact Line with Active Clickable Links
  const phone = pInfo.phone || '';
  const email = pInfo.email || '';
  const linkedin = pInfo.linkedin_url || pInfo.linkedinUrl || '';
  const github = pInfo.github_url || pInfo.githubUrl || '';
  const portfolio = pInfo.portfolio_url || pInfo.portfolioUrl || '';
  const leetcode = pInfo.leetcode_url || pInfo.leetcodeUrl || '';

  const contactItems: { label: string; url?: string }[] = [];
  if (phone) contactItems.push({ label: phone, url: `tel:${phone.replace(/[^\d+]/g, '')}` });
  if (email) contactItems.push({ label: email, url: `mailto:${email}` });
  if (linkedin) contactItems.push({ label: 'LinkedIn', url: linkedin });
  if (github) contactItems.push({ label: 'GitHub', url: github });
  if (portfolio) contactItems.push({ label: 'Portfolio', url: portfolio });
  if (leetcode) contactItems.push({ label: 'LeetCode', url: leetcode });

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);

  // Measure total width to center on page
  const sep = '   |   ';
  let totalContactWidth = 0;
  contactItems.forEach((item, idx) => {
    totalContactWidth += doc.getTextWidth(item.label);
    if (idx < contactItems.length - 1) {
      totalContactWidth += doc.getTextWidth(sep);
    }
  });

  let curX = (pageWidth - totalContactWidth) / 2;
  contactItems.forEach((item, idx) => {
    const itemWidth = doc.getTextWidth(item.label);
    if (item.url) {
      doc.setTextColor(37, 99, 235); // Blue link color
      doc.text(item.label, curX, y);
      doc.link(curX, y - 8, itemWidth, 10, { url: item.url });
    } else {
      doc.setTextColor(51, 65, 85);
      doc.text(item.label, curX, y);
    }
    curX += itemWidth;

    if (idx < contactItems.length - 1) {
      doc.setTextColor(148, 163, 184); // Muted separator
      doc.text(sep, curX, y);
      curX += doc.getTextWidth(sep);
    }
  });
  y += 14;

  // 4. Education (At the top)
  const educations = resume.educations || [];
  if (educations.length > 0) {
    drawSectionHeader('Education');
    educations.forEach(edu => {
      checkPageBreak(24);
      doc.setFont('times', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(edu.institution_name, margin, y);

      const dates = `${edu.start_date || ''} – ${edu.end_date || ''}`.replace(/^– | –$/, '').trim();
      if (dates) {
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text(dates, margin + contentWidth, y, { align: 'right' });
      }
      y += 11;

      doc.setFont('times', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);

      const deg = edu.degree;
      const isSchool = /school|vidyalaya|10th|12th|intermediate|matriculation/i.test(edu.institution_name + ' ' + deg);
      const fieldStr = (!isSchool && edu.field_of_study && !deg.toLowerCase().includes(edu.field_of_study.toLowerCase()))
        ? ` in ${edu.field_of_study}`
        : '';
      const degreeText = `${deg}${fieldStr}`;
      doc.text(degreeText, margin, y);

      if (edu.grade_or_gpa) {
        doc.setFont('times', 'normal');
        doc.text(edu.grade_or_gpa, margin + contentWidth, y, { align: 'right' });
      }
      y += 12;
    });
  }

  // 5. Projects (Second)
  const projects = resume.projects || [];
  if (projects.length > 0) {
    drawSectionHeader('Projects');
    projects.forEach(proj => {
      checkPageBreak(28);
      doc.setFont('times', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);

      // Clean project title (never date)
      const cleanTitle = proj.title;
      doc.text(cleanTitle, margin, y);
      const titleWidth = doc.getTextWidth(cleanTitle);

      // If repo_url exists, add small clickable GitHub icon/link
      if (proj.repo_url) {
        doc.setFontSize(8);
        doc.setTextColor(37, 99, 235);
        doc.text('[GitHub]', margin + titleWidth + 4, y);
        doc.link(margin + titleWidth + 4, y - 7, doc.getTextWidth('[GitHub]'), 9, { url: proj.repo_url });
      }

      // Tech stack in italics
      const techStr = proj.technologies && proj.technologies.length > 0
        ? ` | ${proj.technologies.join(', ')}`
        : '';
      if (techStr) {
        doc.setFont('times', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const linkOffset = proj.repo_url ? doc.getTextWidth('[GitHub]') + 7 : 4;
        doc.text(techStr, margin + titleWidth + linkOffset, y);
      }

      // Project date on right
      const dateStr = proj.end_date || proj.start_date || '';
      if (dateStr) {
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text(dateStr, margin + contentWidth, y, { align: 'right' });
      }
      y += 11;

      // Project Bullets
      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      (proj.bullet_points || []).forEach(bp => {
        const lines = doc.splitTextToSize(`•   ${bp}`, contentWidth - 8);
        checkPageBreak(lines.length * 10.5 + 2);
        doc.text(lines, margin + 4, y);
        y += lines.length * 10.5 + 1.5;
      });
      y += 3;
    });
  }

  // 6. Experience (if present)
  const experiences = resume.experiences || [];
  if (experiences.length > 0) {
    drawSectionHeader('Experience');
    experiences.forEach(exp => {
      checkPageBreak(26);
      doc.setFont('times', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${exp.company_name} — ${exp.job_title}`, margin, y);

      const dates = `${exp.start_date || ''} – ${exp.end_date || 'Present'}`.replace(/^– | –$/, '').trim();
      if (dates) {
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text(dates, margin + contentWidth, y, { align: 'right' });
      }
      y += 11;

      doc.setFont('times', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);
      (exp.bullet_points || []).forEach(bp => {
        const lines = doc.splitTextToSize(`•   ${bp}`, contentWidth - 8);
        checkPageBreak(lines.length * 10.5 + 2);
        doc.text(lines, margin + 4, y);
        y += lines.length * 10.5 + 1.5;
      });
      y += 3;
    });
  }

  // 7. Technical Skills (Third)
  const skills = resume.skills || [];
  if (skills.length > 0) {
    drawSectionHeader('Technical Skills');
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    const categories: Record<string, string[]> = {};
    skills.forEach((s: any) => {
      const cat = s.category || 'Technologies and Frameworks';
      const name = s.skill_name || s.name || s;
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(name);
    });

    Object.entries(categories).forEach(([cat, sList]) => {
      checkPageBreak(13);
      doc.setFont('times', 'bold');
      const catLabel = `${cat}: `;
      doc.text(catLabel, margin, y);
      const catWidth = doc.getTextWidth(catLabel);

      doc.setFont('times', 'normal');
      const lines = doc.splitTextToSize(sList.join(', '), contentWidth - catWidth);
      doc.text(lines, margin + catWidth, y);
      y += lines.length * 10.5 + 2;
    });
  }

  // 8. Coursework & Certifications (Fourth)
  const coursework = (resume.coursework && resume.coursework.length > 0)
    ? resume.coursework
    : (resume.certifications || []);
  if (coursework.length > 0) {
    drawSectionHeader('Coursework & Certifications');
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    coursework.forEach(cw => {
      checkPageBreak(13);
      const parts = cw.split(':');
      if (parts.length > 1) {
        doc.setFont('times', 'bold');
        const prefix = `•   ${parts[0].trim()}: `;
        doc.text(prefix, margin + 4, y);
        const prefixWidth = doc.getTextWidth(prefix);

        doc.setFont('times', 'normal');
        const desc = parts.slice(1).join(':').trim();
        const lines = doc.splitTextToSize(desc, contentWidth - prefixWidth - 8);
        doc.text(lines, margin + 4 + prefixWidth, y);
        y += lines.length * 10.5 + 2;
      } else {
        doc.setFont('times', 'normal');
        const lines = doc.splitTextToSize(`•   ${cw}`, contentWidth - 8);
        doc.text(lines, margin + 4, y);
        y += lines.length * 10.5 + 2;
      }
    });
  }

  // 9. Involvement & Extracurriculars (Fifth)
  const involvements = (resume.involvements && resume.involvements.length > 0)
    ? resume.involvements
    : (resume.achievements || []);
  if (involvements.length > 0) {
    drawSectionHeader('Involvement');
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);

    involvements.forEach(inv => {
      checkPageBreak(13);
      const parts = inv.split(':');
      if (parts.length > 1) {
        doc.setFont('times', 'bold');
        const prefix = `•   ${parts[0].trim()}: `;
        doc.text(prefix, margin + 4, y);
        const prefixWidth = doc.getTextWidth(prefix);

        doc.setFont('times', 'normal');
        const desc = parts.slice(1).join(':').trim();
        const lines = doc.splitTextToSize(desc, contentWidth - prefixWidth - 8);
        doc.text(lines, margin + 4 + prefixWidth, y);
        y += lines.length * 10.5 + 2;
      } else {
        doc.setFont('times', 'normal');
        const lines = doc.splitTextToSize(`•   ${inv}`, contentWidth - 8);
        doc.text(lines, margin + 4, y);
        y += lines.length * 10.5 + 2;
      }
    });
  }

  // Save the real binary PDF
  const safeName = (pInfo.full_name || 'Resume').replace(/\s+/g, '_');
  const safeCompany = (companyName || 'Target').replace(/\s+/g, '_');
  doc.save(`Resume_${safeName}_${safeCompany}.pdf`);
}
