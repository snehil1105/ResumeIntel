import { jsPDF } from 'jspdf';
import { MasterResume } from '../types';

/**
 * Normalizes text to pure WinAnsi / ASCII-safe characters so jsPDF never switches
 * to UTF-16BE encoding (which breaks word spacing and line wrapping).
 */
function sanitizePdfText(txt?: string | null): string {
  return (txt || '')
    .replace(/[\u2010-\u2015\u2212\u00AD]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/\u00a0/g, ' ')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildResumePdfDoc(resume: MasterResume, scale: number): jsPDF {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 34;
  const contentWidth = pageWidth - margin * 2;
  const bottomMargin = 34;
  let y = 30;

  const fBody = 9.0 * scale;
  const fSub = 9.5 * scale;
  const fHeader = 10.5 * scale;
  const fName = 19.0 * scale;
  const lh = 10.4 * scale;
  const lhLabel = 10.0 * scale;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      y = 28;
    }
  };

  const drawBulletLine = (rawText: string) => {
    const clean = sanitizePdfText(rawText);
    if (!clean) return;
    doc.setFont('times', 'normal');
    doc.setFontSize(fBody);
    doc.setTextColor(30, 41, 59);
    const lines: string[] = doc.splitTextToSize(clean, contentWidth - 14);
    checkPageBreak(lines.length * lh + 1.5 * scale);
    doc.setFillColor(30, 41, 59);
    doc.circle(margin + 5, y - 2.8 * scale, 1.3, 'F');
    lines.forEach((line) => {
      doc.text(line, margin + 12, y);
      y += lh;
    });
    y += 1.0 * scale;
  };

  const drawLabeledParagraph = (label: string, desc: string) => {
    const cleanLabel = sanitizePdfText(label);
    const cleanDesc = sanitizePdfText(desc);
    const fullStr = cleanLabel ? `${cleanLabel}: ${cleanDesc}` : cleanDesc;
    doc.setFont('times', 'normal');
    doc.setFontSize(fBody);
    const lines: string[] = doc.splitTextToSize(fullStr, contentWidth);
    checkPageBreak(lines.length * lhLabel + 1.5 * scale);

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
      y += lhLabel;
    });
    y += 1.2 * scale;
  };

  const drawSectionHeader = (title: string) => {
    checkPageBreak(20 * scale);
    y += 3.5 * scale;
    doc.setFont('times', 'bold');
    doc.setFontSize(fHeader);
    doc.setTextColor(15, 23, 42);
    doc.text(title.toUpperCase(), margin, y);
    y += 2.5 * scale;
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.75);
    doc.line(margin, y, margin + contentWidth, y);
    y += 9.5 * scale;
  };

  const pInfo: any = resume.personal_info || (resume as any).personalInfo || {};

  // 1. Candidate Full Name
  doc.setFont('times', 'bold');
  doc.setFontSize(fName);
  doc.setTextColor(15, 23, 42);
  const fullName = sanitizePdfText(pInfo.full_name || pInfo.fullName || 'Candidate Name').toUpperCase();
  doc.text(fullName, pageWidth / 2, y, { align: 'center' });
  y += 13 * scale;

  // 2. Location (Single-line guard: strip candidate name or leaked education keywords)
  let rawLoc = sanitizePdfText(pInfo.location || '');
  if (rawLoc.toLowerCase().includes(fullName.toLowerCase())) {
    rawLoc = rawLoc.replace(new RegExp(fullName, 'i'), '').trim();
  }
  if (/university|institute|college|school|education/i.test(rawLoc)) {
    rawLoc = '';
  }
  if (rawLoc) {
    doc.setFont('times', 'normal');
    doc.setFontSize(fBody);
    doc.setTextColor(71, 85, 105);
    doc.text(rawLoc, pageWidth / 2, y, { align: 'center' });
    y += 11 * scale;
  }

  // 3. Contact Line with Active Clickable Links
  const phone = sanitizePdfText(pInfo.phone || '');
  const email = sanitizePdfText(pInfo.email || '');
  const linkedin = (pInfo.linkedin_url || pInfo.linkedinUrl || '').trim();
  const github = (pInfo.github_url || pInfo.githubUrl || '').trim();
  const portfolio = (pInfo.portfolio_url || pInfo.portfolioUrl || '').trim();
  const leetcode = (pInfo.leetcode_url || pInfo.leetcodeUrl || '').trim();

  const contactItems: { label: string; url?: string }[] = [];
  if (phone) contactItems.push({ label: phone, url: `tel:${phone.replace(/[^\d+]/g, '')}` });
  if (email) contactItems.push({ label: email, url: `mailto:${email}` });
  if (linkedin) contactItems.push({ label: 'LinkedIn', url: linkedin });
  if (github) contactItems.push({ label: 'GitHub', url: github });
  if (portfolio) contactItems.push({ label: 'Portfolio', url: portfolio });
  if (leetcode) contactItems.push({ label: 'LeetCode', url: leetcode });

  doc.setFont('times', 'normal');
  doc.setFontSize(8.5 * scale);

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
      doc.setTextColor(37, 99, 235);
      doc.text(item.label, curX, y);
      doc.link(curX, y - 8, itemWidth, 10, { url: item.url });
    } else {
      doc.setTextColor(51, 65, 85);
      doc.text(item.label, curX, y);
    }
    curX += itemWidth;

    if (idx < contactItems.length - 1) {
      doc.setTextColor(148, 163, 184);
      doc.text(sep, curX, y);
      curX += doc.getTextWidth(sep);
    }
  });
  y += 12 * scale;

  // 4. Education (At the top)
  const educations = resume.educations || [];
  if (educations.length > 0) {
    drawSectionHeader('Education');
    educations.forEach(edu => {
      checkPageBreak(22 * scale);
      doc.setFont('times', 'bold');
      doc.setFontSize(fSub);
      doc.setTextColor(15, 23, 42);
      doc.text(sanitizePdfText(edu.institution_name), margin, y);

      const dates = sanitizePdfText(`${edu.start_date || ''} - ${edu.end_date || ''}`.replace(/^- | -$/, '').trim());
      if (dates) {
        doc.setFont('times', 'normal');
        doc.setFontSize(fBody);
        doc.setTextColor(51, 65, 85);
        doc.text(dates, margin + contentWidth, y, { align: 'right' });
      }
      y += 10.2 * scale;

      doc.setFont('times', 'italic');
      doc.setFontSize(fBody);
      doc.setTextColor(51, 65, 85);

      const deg = sanitizePdfText(edu.degree);
      const isSchool = /school|vidyalaya|10th|12th|intermediate|matriculation/i.test(edu.institution_name + ' ' + deg);
      const fieldStr = (!isSchool && edu.field_of_study && !/\bin\b/i.test(deg) && !deg.toLowerCase().includes(edu.field_of_study.toLowerCase()))
        ? ` in ${sanitizePdfText(edu.field_of_study)}`
        : '';
      doc.text(`${deg}${fieldStr}`, margin, y);

      if (edu.grade_or_gpa) {
        doc.setFont('times', 'normal');
        doc.text(sanitizePdfText(edu.grade_or_gpa), margin + contentWidth, y, { align: 'right' });
      }
      y += 10.5 * scale;
    });
  }

  // 5. Projects
  const projects = resume.projects || [];
  if (projects.length > 0) {
    drawSectionHeader('Projects');
    projects.forEach(proj => {
      checkPageBreak(24 * scale);
      doc.setFont('times', 'bold');
      doc.setFontSize(fSub);
      doc.setTextColor(15, 23, 42);

      const cleanTitle = sanitizePdfText(proj.title).replace(/\s+W$/, '').trim();
      doc.text(cleanTitle, margin, y);
      const titleWidth = doc.getTextWidth(cleanTitle);

      if (proj.repo_url) {
        doc.setFontSize(8 * scale);
        doc.setTextColor(37, 99, 235);
        doc.text('[GitHub]', margin + titleWidth + 4, y);
        doc.link(margin + titleWidth + 4, y - 7, doc.getTextWidth('[GitHub]'), 9, { url: proj.repo_url });
      }

      const dateStr = sanitizePdfText(proj.end_date || proj.start_date || '');
      const cleanTechs = (proj.technologies || []).map(t => sanitizePdfText(t).replace(/^,+|,+$/g, '').trim()).filter(Boolean);
      const techStr = cleanTechs.length > 0
        ? ` | ${cleanTechs.join(', ')}`
        : '';
      if (techStr) {
        doc.setFont('times', 'italic');
        doc.setFontSize(8.5 * scale);
        doc.setTextColor(71, 85, 105);
        const linkOffset = proj.repo_url ? doc.getTextWidth('[GitHub]') + 7 : 4;
        const maxTechWidth = contentWidth - titleWidth - linkOffset - (dateStr ? 75 : 5);
        const safeTech = doc.splitTextToSize(sanitizePdfText(techStr), Math.max(80, maxTechWidth))[0] || '';
        doc.text(safeTech, margin + titleWidth + linkOffset, y);
      }

      if (dateStr) {
        doc.setFont('times', 'normal');
        doc.setFontSize(fBody);
        doc.setTextColor(51, 65, 85);
        doc.text(dateStr, margin + contentWidth, y, { align: 'right' });
      }
      y += 10.5 * scale;

      (proj.bullet_points || []).forEach(bp => drawBulletLine(bp));
      y += 1.5 * scale;
    });
  }

  // 6. Experience (if present)
  const experiences = resume.experiences || [];
  if (experiences.length > 0) {
    drawSectionHeader('Experience');
    experiences.forEach(exp => {
      checkPageBreak(22 * scale);
      doc.setFont('times', 'bold');
      doc.setFontSize(fSub);
      doc.setTextColor(15, 23, 42);
      doc.text(sanitizePdfText(`${exp.company_name} - ${exp.job_title}`), margin, y);

      const dates = sanitizePdfText(`${exp.start_date || ''} - ${exp.end_date || 'Present'}`.replace(/^- | -$/, '').trim());
      if (dates) {
        doc.setFont('times', 'normal');
        doc.setFontSize(fBody);
        doc.setTextColor(51, 65, 85);
        doc.text(dates, margin + contentWidth, y, { align: 'right' });
      }
      y += 10.5 * scale;

      (exp.bullet_points || []).forEach(bp => drawBulletLine(bp));
      y += 1.5 * scale;
    });
  }

  // 7. Technical Skills
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

  // 8. Coursework & Certifications
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

  // 9. Involvement & Extracurriculars
  const involvements = ((resume.involvements && resume.involvements.length > 0)
    ? resume.involvements
    : (resume.achievements || [])).filter(inv => !isLeakedMeta(inv));

  if (involvements.length > 0) {
    drawSectionHeader('Involvement');
    involvements.forEach(inv => {
      const cleanedInv = inv.replace(/:\s*W\s+/g, ': ');
      const idx = cleanedInv.indexOf(':');
      if (idx > 0 && idx < 45) {
        drawLabeledParagraph(cleanedInv.slice(0, idx), cleanedInv.slice(idx + 1));
      } else {
        drawLabeledParagraph('', cleanedInv);
      }
    });
  }

  return doc;
}

/**
 * Generates and downloads a genuine, 100% binary ATS-compliant PDF resume
 * that automatically scales font & spacing to fill 1 full A4 page cleanly without spilling onto Page 2.
 */
export function downloadResumeAsPDF(
  resume: MasterResume,
  companyName: string = 'Company',
  _jobTitle: string = ''
): void {
  const scales = [1.20, 1.14, 1.08, 1.02, 0.96, 0.90, 0.85];
  let chosenDoc: jsPDF | null = null;

  for (const s of scales) {
    const candidate = buildResumePdfDoc(resume, s);
    if (candidate.getNumberOfPages() === 1) {
      chosenDoc = candidate;
      break;
    }
    chosenDoc = candidate;
  }

  const pInfo: any = resume.personal_info || (resume as any).personalInfo || {};
  const safeName = sanitizePdfText(pInfo.full_name || pInfo.fullName || 'Resume').replace(/\s+/g, '_');
  const safeCompany = sanitizePdfText(companyName || 'Target').replace(/\s+/g, '_');
  (chosenDoc || buildResumePdfDoc(resume, 0.95)).save(`Resume_${safeName}_${safeCompany}.pdf`);
}
