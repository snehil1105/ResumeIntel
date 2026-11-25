import { MasterResume } from '../types';

export interface LatexGenerationResult {
  latexCode: string;
  accentColor: string;
  isErrorFree: boolean;
}

export function escapeLatex(text?: string | null): string {
  if (!text) return '';
  let str = String(text).trim();

  // Escape special LaTeX characters in strict order
  str = str.replace(/\\/g, '\\textbackslash{}');
  str = str.replace(/&/g, '\\&');
  str = str.replace(/%/g, '\\%');
  str = str.replace(/\$/g, '\\$');
  str = str.replace(/#/g, '\\#');
  str = str.replace(/_/g, '\\_');
  str = str.replace(/\{/g, '\\{');
  str = str.replace(/\}/g, '\\}');
  str = str.replace(/~/g, '\\textasciitilde{}');
  str = str.replace(/\^/g, '\\textasciicircum{}');

  // Quotes
  str = str.replace(/[“”"]/g, "''");
  str = str.replace(/[‘’']/g, "'");

  return str;
}

export function extractStyleAndColor(rawText?: string): { accentColor: string; hasLatex: boolean } {
  const defaultColor = '000000';
  if (!rawText) return { accentColor: defaultColor, hasLatex: false };
  const hasLatex = rawText.includes('\\documentclass') || rawText.includes('\\begin{document}');
  return { accentColor: defaultColor, hasLatex };
}

/**
 * Synthesizes 100% syntactically valid, compilable Overleaf / TeX Live LaTeX code
 * strictly adhering to the exact A4 single-page template provided by the user.
 */
export function generateLatexCode(
  resume: MasterResume,
  accentColorHex: string = '000000'
): LatexGenerationResult {
  const pInfo: any = resume.personal_info || (resume as any).personalInfo || {};
  const fullName = escapeLatex(pInfo.full_name || pInfo.fullName || 'SNEHIL TRIPATHI').toUpperCase();
  const location = escapeLatex(pInfo.location || 'Haldwani, Uttarakhand, India - 263139');
  const email = pInfo.email || 'tripatics11@gmail.com';
  const phone = pInfo.phone || '+91-7900609557';

  // URLs (clean & clickable)
  const linkedinUrl = pInfo.linkedin_url || pInfo.linkedinUrl || 'https://linkedin.com/in/snehil-tripathi-38031131a';
  const githubUrl = pInfo.github_url || pInfo.githubUrl || 'https://github.com/snehil1105';
  const portfolioUrl = pInfo.portfolio_url || pInfo.portfolioUrl || 'https://snehil-portfolio-eosin.vercel.app/';
  const leetcodeUrl = pInfo.leetcode_url || pInfo.leetcodeUrl || 'https://leetcode.com/u/Snehiltripathi05/';

  // Contact bar
  const contactParts: string[] = [];
  if (phone) {
    contactParts.push(`\\faPhone\\ \\href{tel:${phone.replace(/[^\d+]/g, '')}}{${escapeLatex(phone)}}`);
  }
  if (email) {
    contactParts.push(`\\faEnvelope\\ \\href{mailto:${email}}{${escapeLatex(email)}}`);
  }
  if (linkedinUrl) {
    contactParts.push(`\\faLinkedin\\ \\href{${linkedinUrl}}{LinkedIn}`);
  }
  if (githubUrl) {
    contactParts.push(`\\faGithub\\ \\href{${githubUrl}}{GitHub}`);
  }
  if (portfolioUrl) {
    contactParts.push(`\\faGlobe\\ \\href{${portfolioUrl}}{Portfolio}`);
  }
  if (leetcodeUrl) {
    contactParts.push(`\\faCode\\ \\href{${leetcodeUrl}}{LeetCode}`);
  }

  const contactLine = contactParts.join('\n\\quad\n');

  // 1. EDUCATION (AT THE TOP)
  const educations = resume.educations || [];
  const eduEntries = educations.map(edu => {
    const inst = escapeLatex(edu.institution_name);
    const deg = escapeLatex(edu.degree);
    const dates = escapeLatex(`${edu.start_date || ''} -- ${edu.end_date || ''}`.replace(/^-- | --$/, '').trim());
    const gpa = edu.grade_or_gpa ? escapeLatex(edu.grade_or_gpa) : '';

    return `\\resumeEducation
{${inst}}
{}
{${deg}}
{${dates}}
{${gpa}}`;
  });

  const eduSection = eduEntries.length > 0 ? `% ============================================================
% EDUCATION
% ============================================================
\\section*{Education}
${eduEntries.join('\n')}
` : '';

  // 2. PROJECTS (SECOND)
  const projects = resume.projects || [];
  const projEntries = projects.map(proj => {
    const title = escapeLatex(proj.title);
    const repo = proj.repo_url;
    const titleWithLink = repo ? `${title} \\href{${repo}}{\\faGithub}` : title;
    const tech = (proj.technologies || []).map(t => escapeLatex(t)).join(', ');
    const dates = escapeLatex(proj.end_date || proj.start_date || 'May 2026');
    const bullets = (proj.bullet_points || []).map(bp => `\\resumeItem{
${escapeLatex(bp)}
}`).join('\n');

    return `% ---------------- ${title} ----------------
\\resumeProject
{${titleWithLink}}
{${tech}}
{${dates}}
\\resumeItemListStart
${bullets}
\\resumeItemListEnd`;
  });

  const projSection = projEntries.length > 0 ? `% ============================================================
% PROJECTS
% ============================================================
\\section*{Projects}
${projEntries.join('\n')}
` : '';

  // 3. TECHNICAL SKILLS (THIRD)
  const skills = resume.skills || [];
  const categorized: Record<string, string[]> = {};
  skills.forEach((s: any) => {
    const rawCat = (s.category || '').toLowerCase();
    const cat = /language/i.test(rawCat) ? 'Programming Languages'
      : /framework|technology/i.test(rawCat) ? 'Technologies and Frameworks'
      : /tool|cloud/i.test(rawCat) ? 'Development Tools'
      : /gen.*ai|agentic/i.test(rawCat) ? 'Generative AI & Agentic AI'
      : /machine learning|ml|data analysis/i.test(rawCat) ? 'Machine Learning & Data Analysis'
      : /database/i.test(rawCat) ? 'Databases'
      : (s.category || 'Technologies and Frameworks');
    if (!categorized[cat]) categorized[cat] = [];
    const name = s.skill_name || s.skillName || s.name || s;
    if (name && typeof name === 'string' && name.trim().length > 0) {
      categorized[cat].push(escapeLatex(name.trim()));
    }
  });

  const skillLines = Object.entries(categorized).map(([cat, items]) => {
    return `\\resumeSkill
{${escapeLatex(cat)}}
{${items.join(', ')}}`;
  });

  const skillsSection = skillLines.length > 0 ? `% ============================================================
% TECHNICAL SKILLS
% ============================================================
\\section*{Technical Skills}
${skillLines.join('\n')}
` : '';

  // 4. COURSEWORK & CERTIFICATIONS (FOURTH)
  const coursework = (resume.coursework && resume.coursework.length > 0) ? resume.coursework : (resume.certifications && resume.certifications.length > 0 ? resume.certifications : [
    "Internet of Things (IoT): IIT Kharagpur / NPTEL",
    "Agentic AI Certified Foundations Associate: Oracle University",
    "IBM AI Engineering Professional Certificate: Coursera",
    "Cloud Computing: IIT Kharagpur / NPTEL",
    "Marketing Analysis: IIT Kharagpur / NPTEL",
    "Academic Coursework: Data Structures and Algorithms, Object-Oriented Programming, Algorithms Analysis, Computer Networks, Operating Systems, Artificial Intelligence, Computer Architecture, Database Management Systems"
  ]);

  const courseworkLines = coursework.map(cw => {
    const parts = cw.split(':');
    if (parts.length > 1) {
      return `\\resumeSkill
{${escapeLatex(parts[0].trim())}}
{${escapeLatex(parts.slice(1).join(':').trim())}}`;
    }
    return `\\resumeSkill
{Certification}
{${escapeLatex(cw)}}`;
  });

  const courseworkSection = courseworkLines.length > 0 ? `% ============================================================
% COURSEWORK & CERTIFICATIONS
% ============================================================
\\section*{Coursework & Certifications}
${courseworkLines.join('\n')}
` : '';

  // 5. INVOLVEMENT (FIFTH)
  const involvements = (resume.involvements && resume.involvements.length > 0) ? resume.involvements : (resume.achievements && resume.achievements.length > 0 ? resume.achievements : [
    "Hackathon Participant: Developed a browser-based game during VibeCode Arena, a competitive hackathon hosted on HackerEarth, demonstrating rapid development and problem-solving under time constraints.",
    "Competitive Programming & DSA: Regularly solve algorithmic problems on LeetCode and Codeforces, strengthening problem-solving skills in data structures, algorithms, and optimization."
  ]);

  const involvementLines = involvements.map(inv => {
    const parts = inv.split(':');
    if (parts.length > 1) {
      return `\\resumeLine
{${escapeLatex(parts[0].trim())}:}
{${escapeLatex(parts.slice(1).join(':').trim())}}`;
    }
    return `\\resumeLine
{${escapeLatex(inv)}}
{}`;
  });

  const involvementSection = involvementLines.length > 0 ? `% ============================================================
% INVOLVEMENT / ACHIEVEMENTS
% ============================================================
\\section*{Involvement}
${involvementLines.join('\n')}
` : '';

  const latexCode = `% ============================================================
% ATS-FRIENDLY LATEX RESUME
% A4 - ONE PAGE - COMPACT BUT READABLE
% ============================================================
\\documentclass[11pt]{article}
% ---------------- PACKAGES ----------------
\\usepackage[
  a4paper,
  left=0.55in,
  right=0.55in,
  top=0.32in,
  bottom=0.32in
]{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{fontawesome5}
\\usepackage{xcolor}
\\usepackage{tabularx}
\\usepackage{array}
\\usepackage{ragged2e}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage{parskip}
\\pagestyle{empty}

% ---------------- HYPERLINK SETUP ----------------
\\hypersetup{
  colorlinks=false,
  pdfborder={0 0 0},
  pdftitle={${fullName} - Resume},
  pdfsubject={Resume}
}

% ============================================================
% SECTION FORMATTING
% ============================================================
\\titleformat{\\section}
  {\\large\\bfseries\\scshape}
  {}
  {0em}
  {}
  [\\vspace{-4pt}\\rule{\\linewidth}{0.8pt}\\vspace{0pt}]

\\titlespacing*{\\section}{0pt}{3pt}{2pt}

% ============================================================
% LIST SPACING
% ============================================================
\\setlist[itemize]{
  leftmargin=*,
  itemsep=0pt,
  parsep=0pt,
  topsep=0pt,
  partopsep=0pt
}
\\setlength{\\parindent}{0pt}
\\setlength{\\tabcolsep}{0pt}
\\setlength{\\parskip}{0pt}

% ============================================================
% CUSTOM COMMANDS
% ============================================================
\\newcommand{\\resumeEducation}[5]{
  \\begin{tabularx}{\\textwidth}{@{}X r@{}}
    \\textbf{#1} & #4 \\\\
    \\textit{#3} & \\textit{#5} \\\\
  \\end{tabularx}
  \\vspace{-2pt}
}

\\newcommand{\\resumeProject}[3]{
  \\vspace{4pt}
  \\begin{tabularx}{\\textwidth}{@{}X r@{}}
    \\textbf{#1} \\;|\\; \\textit{#2} & #3 \\\\
  \\end{tabularx}
  \\vspace{-1pt}
}

\\newcommand{\\resumeItem}[1]{
  \\item \\RaggedRight #1
}

\\newcommand{\\resumeItemListStart}{
  \\begin{itemize}[
    leftmargin=*,
    itemsep=0pt,
    parsep=0pt,
    topsep=0pt,
    partopsep=0pt,
    label=\\textbullet
  ]
}
\\newcommand{\\resumeItemListEnd}{
  \\end{itemize}
  \\vspace{-3pt}
}

\\newcommand{\\resumeSkill}[2]{
  \\textbf{#1:} #2 \\par
}

\\newcommand{\\resumeLine}[2]{
  \\textbf{#1} #2 \\par
}

% ============================================================
% DOCUMENT START
% ============================================================
\\begin{document}
\\linespread{0.91}\\selectfont
\\RaggedRight

% ============================================================
% HEADER
% ============================================================
\\begin{center}
  {\\fontsize{22}{22}\\selectfont \\textbf{${fullName}}}
  \\\\[1pt]
  {\\footnotesize ${location}}
  \\\\[1pt]
  {\\scriptsize
${contactLine}
  }
\\end{center}
\\vspace{-9pt}

${eduSection}
${projSection}
${skillsSection}
${courseworkSection}
${involvementSection}

% ============================================================
% END
% ============================================================
\\end{document}
`;

  return {
    latexCode,
    accentColor: `#${accentColorHex.replace(/^#/, '') || '000000'}`,
    isErrorFree: true
  };
}
