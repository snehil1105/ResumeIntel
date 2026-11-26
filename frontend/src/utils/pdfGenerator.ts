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
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 34;
  const contentWidth = pageWidth - margin * 2;
  let y = 32;

  const sanitizePdfText = (txt: string): string => {
    return (txt || '')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201c\u201d]/g, '"')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Helper for automatic page breaks
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 24) {
      doc.addPage();
      y = 30;
    }
  };

  // Draw a bullet point with crisp vector dot & zero spacing distortion
  const drawBulletLine = (rawText: string) => {
    const clean = sanitizePdfText(rawText);
    if (!clean) return;
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    const lines: string[] = doc.splitTextToSize(clean, contentWidth - 14);
    checkPageBreak(lines.length * 10 + 2);
    doc.setFillColor(30, 41, 59);
    doc.circle(margin + 5, y - 2.8, 1.3, 'F');
    lines.forEach((line) => {
      doc.text(line, margin + 12, y);
      y += 10;
    });
    y += 1;
  };

  // Draw "Label: description" where wrapped lines align cleanly at margin
  const drawLabeledParagraph = (label: string, desc: string) => {
    const cleanLabel = sanitizePdfText(label);
    const cleanDesc = sanitizePdfText(desc);
    const fullStr = cleanLabel ? `${cleanLabel}: ${cleanDesc}` : cleanDesc;
    doc.setFont('times', 'normal');
    doc.setFontSize(8.8);
    const lines: string[] = doc.splitTextToSize(fullStr, contentWidth);
    checkPageBreak(lines.length * 9.8 + 2);

    lines.forEach((line, idx) => {
      if (idx === 0 && cleanLabel && line.startsWith(`${cleanLabel}:`)) {
        doc.setFont('times', 'bold');
        doc.setTextColor(15, 23, 42);
        const prefix = `${cleanLabel}: `;
        doc.text(prefix, margin, y);
        const pw = doc.getTextWidth(prefix);
        doc.setFont('times', 'normal');
        doc.setTextColor(30, 41, 59);
        doc.text(line.slice(prefix.length), margin + pw, y);
      } else {
        doc.setFont('times', 'normal');
        doc.setTextColor(30, 41, 59);
        doc.text(line, margin, y);
      }
      y += 9.8;
    });
    y += 1.2;
  };

  // Section Header helper (matching Jake's resume horizontal line style)
  const drawSectionHeader = (title: string) => {
    checkPageBreak(22);
    y += 4;
    doc.setFont('times', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(title.toUpperCase(), margin, y);
    y += 2.5;
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.75);
    doc.line(margin, y, margin + contentWidth, y);
    y += 10;
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

      const deg = sanitizePdfText(edu.degree);
      const isSchool = /school|vidyalaya|10th|12th|intermediate|matriculation/i.test(edu.institution_name + ' ' + deg);
      const fieldStr = (!isSchool && edu.field_of_study && !/\bin\b/i.test(deg) && !deg.toLowerCase().includes(edu.field_of_study.toLowerCase()))
        ? ` in ${sanitizePdfText(edu.field_of_study)}`
        : '';
      const degreeText = `${deg}${fieldStr}`;
      doc.text(degreeText, margin, y);

      if (edu.grade_or_gpa) {
        doc.setFont('times', 'normal');
        doc.text(sanitizePdfText(edu.grade_or_gpa), margin + contentWidth, y, { align: 'right' });
      }
      y += 10.5;
    });
  }

  // 5. Projects (Second)
  const projects = resume.projects || [];
  if (projects.length > 0) {
    drawSectionHeader('Projects');
    projects.forEach(proj => {
      checkPageBreak(26);
      doc.setFont('times', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);

      // Clean project title (never date)
      const cleanTitle = sanitizePdfText(proj.title);
      doc.text(cleanTitle, margin, y);
      const titleWidth = doc.getTextWidth(cleanTitle);

      // If repo_url exists, add small clickable GitHub link
      if (proj.repo_url) {
        doc.setFontSize(8);
        doc.setTextColor(37, 99, 235);
        doc.text('[GitHub]', margin + titleWidth + 4, y);
        doc.link(margin + titleWidth + 4, y - 7, doc.getTextWidth('[GitHub]'), 9, { url: proj.repo_url });
      }

      // Tech stack in italics (clipped safely before right-aligned date)
      const dateStr = sanitizePdfText(proj.end_date || proj.start_date || '');
      const techStr = proj.technologies && proj.technologies.length > 0
        ? ` | ${proj.technologies.join(', ')}`
        : '';
      if (techStr) {
        doc.setFont('times', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(71, 85, 105);
        const linkOffset = proj.repo_url ? doc.getTextWidth('[GitHub]') + 7 : 4;
        const maxTechWidth = contentWidth - titleWidth - linkOffset - (dateStr ? 65 : 5);
        const safeTech = doc.splitTextToSize(sanitizePdfText(techStr), Math.max(80, maxTechWidth))[0] || '';
        doc.text(safeTech, margin + titleWidth + linkOffset, y);
      }

      // Project date on right
      if (dateStr) {
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text(dateStr, margin + contentWidth, y, { align: 'right' });
      }
      y += 10.5;

      // Project Bullets
      (proj.bullet_points || []).forEach(bp => drawBulletLine(bp));
      y += 2;
    });
  }

  // 6. Experience (if present)
  const experiences = resume.experiences || [];
  if (experiences.length > 0) {
    drawSectionHeader('Experience');
    experiences.forEach(exp => {
      checkPageBreak(24);
      doc.setFont('times', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(sanitizePdfText(`${exp.company_name} - ${exp.job_title}`), margin, y);

      const dates = sanitizePdfText(`${exp.start_date || ''} - ${exp.end_date || 'Present'}`.replace(/^- | -$/, '').trim());
      if (dates) {
        doc.setFont('times', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text(dates, margin + contentWidth, y, { align: 'right' });
      }
      y += 10.5;

      (exp.bullet_points || []).forEach(bp => drawBulletLine(bp));
      y += 2;
    });
  }

  // 7. Technical Skills (Third)
  const skills = resume.skills || [];
  if (skills.length > 0) {
    drawSectionHeader('Technical Skills');
    const categories: Record<string, string[]> = {};
    skills.forEach((s: any) => {
      const cat = s.category || 'Technologies and Frameworks';
      const name = s.skill_name || s.name || s;
      if (!categories[cat]) categories[cat] = [];
      if (!categories[cat].includes(name)) categories[cat].push(name);
    });

    Object.entries(categories).forEach(([cat, sList]) => {
      drawLabeledParagraph(cat, sList.join(', '));
    });
  }

  // 8. Coursework & Certifications (Fourth)
  const isLeakedMeta = (s: string) => /EXTRACTED HYPERLINKS|^(https?:\/\/|mailto:|tel:)/i.test((s || '').trim());
  const coursework = ((resume.coursework && resume.coursework.length > 0)
    ? resume.coursework
    : (resume.certifications || [])).filter(cw => !isLeakedMeta(cw));

  if (coursework.length > 0) {
    drawSectionHeader('Coursework & Certifications');
    coursework.forEach(cw => {
      const idx = cw.indexOf(':');
      if (idx > 0 && idx < 45) {
        drawLabeledParagraph(cw.slice(0, idx), cw.slice(idx + 1));
      } else {
        drawLabeledParagraph('', cw);
      }
    });
  }

  // 9. Involvement & Extracurriculars (Fifth)
  const involvements = ((resume.involvements && resume.involvements.length > 0)
    ? resume.involvements
    : (resume.achievements || [])).filter(inv => !isLeakedMeta(inv));

  if (involvements.length > 0) {
    drawSectionHeader('Involvement');
    involvements.forEach(inv => {
      const idx = inv.indexOf(':');
      if (idx > 0 && idx < 45) {
        drawLabeledParagraph(inv.slice(0, idx), inv.slice(idx + 1));
      } else {
        drawLabeledParagraph('', inv);
      }
    });
  }

  // Save the real binary PDF
  const safeName = (pInfo.full_name || 'Resume').replace(/\s+/g, '_');
  const safeCompany = (companyName || 'Target').replace(/\s+/g, '_');
  doc.save(`Resume_${safeName}_${safeCompany}.pdf`);
}
