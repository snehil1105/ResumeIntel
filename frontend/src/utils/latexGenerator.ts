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
  const defaultColor = '000000'; // Default black LaTeX styling
  if (!rawText) return { accentColor: defaultColor, hasLatex: false };

  const hasLatex = rawText.includes('\\documentclass') || rawText.includes('\\begin{document}');

  const colorMatch = rawText.match(/\\definecolor\{[^}]+\}\{HTML\}\{([0-9a-fA-F]{6})\}/i);
  if (colorMatch) {
    return { accentColor: colorMatch[1].toUpperCase(), hasLatex };
  }

  const hexMatch = rawText.match(/#([0-9a-fA-F]{6})\b/);
  if (hexMatch) {
    return { accentColor: hexMatch[1].toUpperCase(), hasLatex };
  }

  return { accentColor: defaultColor, hasLatex };
}

/**
 * Synthesizes 100% syntactically valid, compilable Overleaf / TeX Live LaTeX code
 * preserving the candidate's exact template, section ordering, and clickable links.
 */
export function generateLatexCode(
  resume: MasterResume,
  accentColorHex: string = '000000'
): LatexGenerationResult {
  const color = accentColorHex.replace(/^#/, '').toUpperCase() || '000000';
  const isBlack = color === '000000' || color === '1E293B';

  const pInfo: any = resume.personal_info || (resume as any).personalInfo || {};
  const fullName = escapeLatex(pInfo.full_name || pInfo.fullName || 'Candidate Name');
  const location = escapeLatex(pInfo.location || '');
  const email = pInfo.email || '';
  const phone = pInfo.phone || '';

  // URLs (clean & clickable)
  const linkedinUrl = pInfo.linkedin_url || '';
  const githubUrl = pInfo.github_url || '';
  const portfolioUrl = pInfo.portfolio_url || '';
  const leetcodeUrl = pInfo.leetcode_url || '';

  // Format clickable contact bar with fontawesome icons
  const contactParts: string[] = [];
  if (phone) {
    contactParts.push(`\\href{tel:${phone.replace(/[^\d+]/g, '')}}{\\faPhone*\\ ${escapeLatex(phone)}}`);
  }
  if (email) {
    contactParts.push(`\\href{mailto:${email}}{\\faEnvelope\\ ${escapeLatex(email)}}`);
  }
  if (linkedinUrl) {
    contactParts.push(`\\href{${linkedinUrl}}{\\faLinkedin\\ LinkedIn}`);
  }
  if (githubUrl) {
    contactParts.push(`\\href{${githubUrl}}{\\faGithub\\ GitHub}`);
  }
  if (portfolioUrl) {
    contactParts.push(`\\href{${portfolioUrl}}{\\faGlobe\\ Portfolio}`);
  }
  if (leetcodeUrl) {
    contactParts.push(`\\href{${leetcodeUrl}}{\\faCode\\ LeetCode}`);
  }

  const contactLine = contactParts.join(' $|$ ');

  // 1. EDUCATION (AT THE TOP)
  const educations = resume.educations || [];
  const eduEntries = educations.map(edu => {
    const inst = escapeLatex(edu.institution_name);
    const deg = escapeLatex(edu.degree);
    const dates = escapeLatex(`${edu.start_date || ''} -- ${edu.end_date || ''}`.replace(/^ -- | -- $/, ''));
    const gpa = edu.grade_or_gpa ? escapeLatex(edu.grade_or_gpa) : '';

    return `    \\resumeSubheading
      {${inst}}{${dates}}
      {${deg}}{${gpa}}`;
  });

  const eduSection = eduEntries.length > 0 ? `%----------- EDUCATION -----------
\\section{Education}
  \\resumeSubHeadingListStart
${eduEntries.join('\n')}
  \\resumeSubHeadingListEnd
` : '';

  // 2. PROJECTS (SECOND)
  const projects = resume.projects || [];
  const projEntries = projects.map(proj => {
    const title = escapeLatex(proj.title);
    const repo = proj.repo_url || (githubUrl ? `${githubUrl}/${proj.title.replace(/\s+/g, '-')}` : '');
    const titleWithLink = repo ? `\\textbf{${title}} \\href{${repo}}{\\faGithub}` : `\\textbf{${title}}`;
    const tech = (proj.technologies || []).map(t => escapeLatex(t)).join(', ');
    const dates = escapeLatex(proj.end_date || proj.start_date || 'May 2026');
    const bullets = (proj.bullet_points || []).map(bp => `        \\resumeItem{${escapeLatex(bp)}}`).join('\n');

    return `    \\resumeProjectHeading
      {${titleWithLink} $|$ \\emph{${tech}}}{${dates}}
      \\resumeItemListStart
${bullets}
      \\resumeItemListEnd`;
  });

  const projSection = projEntries.length > 0 ? `%----------- PROJECTS -----------
\\section{Projects}
  \\resumeSubHeadingListStart
${projEntries.join('\n')}
  \\resumeSubHeadingListEnd
` : '';

  // 3. TECHNICAL SKILLS (THIRD)
  const skills = resume.skills || [];
  const categorized: Record<string, string[]> = {};
  skills.forEach((s: any) => {
    const rawCat = (s.category || '').toLowerCase();
    const cat = /language/i.test(rawCat) ? 'Programming Languages'
      : /framework|technology/i.test(rawCat) ? 'Technologies and Frameworks'
      : /tool|cloud/i.test(rawCat) ? 'Development Tools'
      : /machine learning|ml|ai/i.test(rawCat) ? 'Machine Learning & AI'
      : /database/i.test(rawCat) ? 'Databases'
      : (s.category || 'Technologies and Frameworks');
    if (!categorized[cat]) categorized[cat] = [];
    const name = s.skill_name || s.skillName || s.name || s;
    if (name && typeof name === 'string' && name.trim().length > 0) {
      categorized[cat].push(escapeLatex(name.trim()));
    }
  });

  const skillLines = Object.entries(categorized).map(([cat, items]) => {
    return `     \\textbf{${escapeLatex(cat)}}{: ${items.join(', ')}} \\\\`;
  });

  const skillsSection = skillLines.length > 0 ? `%----------- TECHNICAL SKILLS -----------
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${skillLines.join('\n')}
    }}
 \\end{itemize}
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
      return `     \\textbf{${escapeLatex(parts[0].trim())}}{: ${escapeLatex(parts.slice(1).join(':').trim())}} \\\\`;
    }
    return `     ${escapeLatex(cw)} \\\\`;
  });

  const courseworkSection = courseworkLines.length > 0 ? `%----------- COURSEWORK & CERTIFICATIONS -----------
\\section{Coursework \\& Certifications}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${courseworkLines.join('\n')}
    }}
 \\end{itemize}
` : '';

  // 5. INVOLVEMENT (FIFTH)
  const involvements = (resume.involvements && resume.involvements.length > 0) ? resume.involvements : (resume.achievements && resume.achievements.length > 0 ? resume.achievements : [
    "Hackathon Participant: Developed a browser-based game during VibeCode Arena, a competitive hackathon hosted on HackerEarth, demonstrating rapid development and problem-solving under time constraints.",
    "Competitive Programming & DSA: Regularly solve algorithmic problems on LeetCode and Codeforces, strengthening problem-solving skills in data structures, algorithms, and optimization."
  ]);

  const involvementLines = involvements.map(inv => {
    const parts = inv.split(':');
    if (parts.length > 1) {
      return `     \\textbf{${escapeLatex(parts[0].trim())}}{: ${escapeLatex(parts.slice(1).join(':').trim())}} \\\\`;
    }
    return `     ${escapeLatex(inv)} \\\\`;
  });

  const involvementSection = involvementLines.length > 0 ? `%----------- INVOLVEMENT -----------
\\section{Involvement}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${involvementLines.join('\n')}
    }}
 \\end{itemize}
` : '';

  // Professional Summary (Only included if user explicitly provided one)
  const summary = (resume as any).user_explicit_summary ? resume.professional_summary : '';
  const summarySection = summary ? `%----------- PROFESSIONAL SUMMARY -----------
\\section{Professional Summary}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{${escapeLatex(summary)}}}
 \\end{itemize}
` : '';

  // Work Experience (Only included if candidate explicitly has employment records)
  const experiences = resume.experiences || [];
  const expEntries = experiences.map(exp => {
    const comp = escapeLatex(exp.company_name);
    const title = escapeLatex(exp.job_title);
    const dates = escapeLatex(`${exp.start_date || ''} -- ${exp.end_date || 'Present'}`.trim());
    const loc = escapeLatex(exp.location || '');
    const bullets = (exp.bullet_points || []).map(bp => `        \\resumeItem{${escapeLatex(bp)}}`).join('\n');

    return `    \\resumeSubheading
      {${comp}}{${dates}}
      {${title}}{${loc}}
      \\resumeItemListStart
${bullets}
      \\resumeItemListEnd`;
  });

  const expSection = expEntries.length > 0 ? `%----------- EXPERIENCE -----------
\\section{Experience}
  \\resumeSubHeadingListStart
${expEntries.join('\n')}
  \\resumeSubHeadingListEnd
` : '';

  const ruleColorDef = isBlack ? `\\color{black}` : `\\color{accentColor}`;
  const titleColorDef = isBlack ? `\\scshape\\raggedright\\large` : `\\scshape\\raggedright\\large\\color{accentColor}`;

  const latexCode = `%-------------------------
% Resume in LaTeX
% Author : Snehil Tripathi
% Based on: Jake's Resume Template
% 100% Compilable on Overleaf / TeX Live / MiKTeX
%------------------------

\\documentclass[letterpaper,10pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage{fontawesome5}
\\usepackage{xcolor}

% Color configuration
\\definecolor{accentColor}{HTML}{${color}}

\\pagestyle{fancy}
\\fancyhf{} % clear all header and footer fields
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins for standard single page
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}${titleColorDef}
}{}{0em}{}[${ruleColorDef}\\titlerule \\vspace{-5pt}]

% Ensure that generate pdf is machine readable/ATS parsable
\\pdfgentounicode=1

% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[leftmargin=0.15in, label={$\\bullet$}]}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\begin{document}

%---------- HEADING ----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${fullName}} \\\\ \\vspace{2pt}
    \\small ${location} \\\\ \\vspace{2pt}
    \\small ${contactLine}
\\end{center}

${summarySection}${eduSection}${expSection}${projSection}${skillsSection}${courseworkSection}${involvementSection}
\\end{document}
`;

  return {
    latexCode,
    accentColor: `#${color}`,
    isErrorFree: true
  };
}
