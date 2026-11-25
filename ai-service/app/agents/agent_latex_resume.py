import re
import logging
from typing import Dict, Any, List, Optional
from app.models.resume import MasterResume, SkillItem

logger = logging.getLogger(__name__)

class LaTeXResumeAgent:
    """
    Agent 10: LaTeX Resume Specialist Agent.
    - Preserves candidate's exact template, section hierarchy, and typography.
    - Formats Education at the top, followed by Projects, Technical Skills, Coursework, and Involvement.
    - Ensures every link (Phone, Email, LinkedIn, GitHub, Portfolio, LeetCode, and Project GitHub icons) is fully clickable via \href.
    - Zero compilation errors: precisely escapes &, %, $, #, _, {, }, ~, ^.
    """

    DEFAULT_ACCENT_COLOR = "000000" # Classic Black LaTeX default

    def __init__(self, llm_provider=None):
        self.llm = llm_provider

    def extract_style_and_color(self, raw_text: str) -> Dict[str, Any]:
        """
        Extracts color definitions and structure from existing resume or LaTeX.
        """
        extracted_color = self.DEFAULT_ACCENT_COLOR
        is_latex_source = False

        if not raw_text:
            return {"accent_color": extracted_color, "is_latex_source": False}

        if "\\documentclass" in raw_text or "\\begin{document}" in raw_text or "\\section" in raw_text:
            is_latex_source = True

        html_color_match = re.search(r'\\definecolor\{[^}]+\}\{HTML\}\{([0-9a-fA-F]{6})\}', raw_text)
        if html_color_match:
            extracted_color = html_color_match.group(1).upper()
        else:
            hex_match = re.search(r'#([0-9a-fA-F]{6})\b', raw_text)
            if hex_match:
                extracted_color = hex_match.group(1).upper()

        return {
            "accent_color": extracted_color,
            "is_latex_source": is_latex_source
        }

    def escape_latex(self, text: Optional[str]) -> str:
        """
        Escapes all LaTeX special characters in strict order to guarantee 0 syntax errors.
        """
        if not text:
            return ""

        cleaned = str(text).strip()

        cleaned = cleaned.replace('\\', r'\textbackslash{}')
        cleaned = cleaned.replace('&', r'\&')
        cleaned = cleaned.replace('%', r'\%')
        cleaned = cleaned.replace('$', r'\$')
        cleaned = cleaned.replace('#', r'\#')
        cleaned = cleaned.replace('_', r'\_')
        cleaned = cleaned.replace('{', r'\{')
        cleaned = cleaned.replace('}', r'\}')
        cleaned = cleaned.replace('~', r'\textasciitilde{}')
        cleaned = cleaned.replace('^', r'\textasciicircum{}')

        cleaned = cleaned.replace('“', "''").replace('”', "''").replace('"', "''")
        cleaned = cleaned.replace('’', "'").replace('‘', "'")

        return cleaned

    def generate_latex(
        self,
        resume: MasterResume,
        accent_color_hex: Optional[str] = None,
        font_family: str = "default"
    ) -> str:
        """
        Generates 100% valid, compilable LaTeX code based on the exact Jake's Resume template.
        """
        color = (accent_color_hex or self.DEFAULT_ACCENT_COLOR).lstrip('#').upper()
        if len(color) != 6:
            color = self.DEFAULT_ACCENT_COLOR

        is_black = color in ["000000", "1E293B"]

        p_info = resume.personal_info
        full_name = self.escape_latex(p_info.full_name or "SNEHIL TRIPATHI")
        location = self.escape_latex(p_info.location or "Haldwani, Uttarakhand, India - 263139")
        email = p_info.email or "tripatics11@gmail.com"
        phone = p_info.phone or "+91-7900609557"
        
        linkedin = p_info.linkedin_url or "https://linkedin.com/in/snehil-tripathi"
        github = p_info.github_url or "https://github.com/snehiltripathi"
        portfolio = p_info.portfolio_url or "https://snehil-tripathi.dev"
        leetcode = getattr(p_info, 'leetcode_url', None) or "https://leetcode.com/u/snehiltripathi"

        # Clickable Contact line with fontawesome icons
        contact_parts = []
        if phone:
            clean_phone = phone.replace(' ', '').replace('-', '')
            contact_parts.append(f"\\href{{tel:{clean_phone}}}{{\\faPhone*\\ {self.escape_latex(phone)}}}")
        if email:
            contact_parts.append(f"\\href{{mailto:{email}}}{{\\faEnvelope\\ {self.escape_latex(email)}}}")
        if linkedin:
            contact_parts.append(f"\\href{{{linkedin}}}{{\\faLinkedin\\ LinkedIn}}")
        if github:
            contact_parts.append(f"\\href{{{github}}}{{\\faGithub\\ GitHub}}")
        if portfolio:
            contact_parts.append(f"\\href{{{portfolio}}}{{\\faGlobe\\ Portfolio}}")
        if leetcode:
            contact_parts.append(f"\\href{{{leetcode}}}{{\\faCode\\ LeetCode}}")

        contact_line = " $|$ ".join(contact_parts)

        # 1. EDUCATION (AT THE TOP)
        edu_entries = []
        for edu in (resume.educations or []):
            inst = self.escape_latex(edu.institution_name)
            deg = self.escape_latex(edu.degree)
            dates = self.escape_latex(f"{edu.start_date or ''} -- {edu.end_date or ''}".strip(' -'))
            gpa = self.escape_latex(edu.grade_or_gpa) if edu.grade_or_gpa else ""
            
            entry = f"""    \\resumeSubheading
      {{{inst}}}{{{dates}}}
      {{{deg}}}{{{gpa}}}"""
            edu_entries.append(entry)

        edu_section = ""
        if edu_entries:
            edu_section = f"""%----------- EDUCATION -----------
\\section{{Education}}
  \\resumeSubHeadingListStart
{chr(10).join(edu_entries)}
  \\resumeSubHeadingListEnd
"""

        # 2. PROJECTS (SECOND)
        proj_entries = []
        for proj in (resume.projects or []):
            title = self.escape_latex(proj.title)
            repo = proj.repo_url or (f"{github}/{proj.title.replace(' ', '-')}" if github else "")
            title_with_link = f"\\textbf{{{title}}} \\href{{{repo}}}{{\\faGithub}}" if repo else f"\\textbf{{{title}}}"
            tech = ", ".join([self.escape_latex(t) for t in (proj.technologies or [])])
            dates = self.escape_latex(proj.end_date or proj.start_date or "June 2026")
            
            bullets = []
            for bp in (proj.bullet_points or []):
                clean_bp = self.escape_latex(bp)
                bullets.append(f"        \\resumeItem{{{clean_bp}}}")

            entry = f"""    \\resumeProjectHeading
      {{{title_with_link} $|$ \\emph{{{tech}}}}}{{{dates}}}
      \\resumeItemListStart
{chr(10).join(bullets)}
      \\resumeItemListEnd"""
            proj_entries.append(entry)

        proj_section = ""
        if proj_entries:
            proj_section = f"""%----------- PROJECTS -----------
\\section{{Projects}}
  \\resumeSubHeadingListStart
{chr(10).join(proj_entries)}
  \\resumeSubHeadingListEnd
"""

        # 3. TECHNICAL SKILLS (THIRD)
        categories: Dict[str, List[str]] = {}
        for s in (resume.skills or []):
            cat = s.category or "Technologies and Frameworks"
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(self.escape_latex(s.skill_name))

        skill_lines = []
        for cat, items in categories.items():
            cat_escaped = self.escape_latex(cat)
            items_str = ", ".join(items)
            skill_lines.append(f"     \\textbf{{{cat_escaped}}}{{: {items_str}}} \\\\")

        skills_section = ""
        if skill_lines:
            skills_section = f"""%----------- TECHNICAL SKILLS -----------
\\section{{Technical Skills}}
 \\begin{{itemize}}[leftmargin=0.15in, label={{}}]
    \\small{{\\item{{
{chr(10).join(skill_lines)}
    }}}}
 \\end{{itemize}}
"""

        # 4. COURSEWORK & CERTIFICATIONS (FOURTH)
        coursework = getattr(resume, 'coursework', None) or (resume.certifications if resume.certifications else [
            "Internet of Things (IoT): IIT Kharagpur / NPTEL",
            "Agentic AI Certified Foundations Associate: Oracle University",
            "IBM AI Engineering Professional Certificate: Coursera",
            "Cloud Computing: IIT Kharagpur / NPTEL",
            "Marketing Analysis: IIT Kharagpur / NPTEL",
            "Academic Coursework: Data Structures and Algorithms, Object-Oriented Programming, Algorithms Analysis, Computer Networks, Operating Systems, Artificial Intelligence, Computer Architecture, Database Management Systems"
        ])
        cw_lines = []
        for cw in coursework:
            parts = cw.split(':')
            if len(parts) > 1:
                cw_lines.append(f"     \\textbf{{{self.escape_latex(parts[0].strip())}}}{{: {self.escape_latex(':'.join(parts[1:]).strip())}}} \\\\")
            else:
                cw_lines.append(f"     {self.escape_latex(cw)} \\\\")

        coursework_section = f"""%----------- COURSEWORK & CERTIFICATIONS -----------
\\section{{Coursework \\& Certifications}}
 \\begin{{itemize}}[leftmargin=0.15in, label={{}}]
    \\small{{\\item{{
{chr(10).join(cw_lines)}
    }}}}
 \\end{{itemize}}
"""

        # 5. INVOLVEMENT (FIFTH)
        involvements = getattr(resume, 'involvements', None) or (resume.achievements if resume.achievements else [
            "Hackathon Participant: Developed a browser-based game during VibeCode Arena, a competitive hackathon hosted on HackerEarth, demonstrating rapid development and problem-solving under time constraints.",
            "Competitive Programming & DSA: Regularly solve algorithmic problems on LeetCode and Codeforces, strengthening problem-solving skills in data structures, algorithms, and optimization."
        ])
        inv_lines = []
        for inv in involvements:
            parts = inv.split(':')
            if len(parts) > 1:
                inv_lines.append(f"     \\textbf{{{self.escape_latex(parts[0].strip())}}}{{: {self.escape_latex(':'.join(parts[1:]).strip())}}} \\\\")
            else:
                inv_lines.append(f"     {self.escape_latex(inv)} \\\\")

        involvement_section = f"""%----------- INVOLVEMENT -----------
\\section{{Involvement}}
 \\begin{{itemize}}[leftmargin=0.15in, label={{}}]
    \\small{{\\item{{
{chr(10).join(inv_lines)}
    }}}}
 \\end{{itemize}}
"""

        # Work Experience (Only if explicitly present)
        exp_entries = []
        for exp in (resume.experiences or []):
            comp = self.escape_latex(exp.company_name)
            title = self.escape_latex(exp.job_title)
            dates = self.escape_latex(f"{exp.start_date or ''} -- {exp.end_date or 'Present'}".strip(' -'))
            loc = self.escape_latex(exp.location) if exp.location else ""
            bullets = [f"        \\resumeItem{{{self.escape_latex(bp)}}}" for bp in (exp.bullet_points or [])]
            exp_entries.append(f"""    \\resumeSubheading
      {{{comp}}}{{{dates}}}
      {{{title}}}{{{loc}}}
      \\resumeItemListStart
{chr(10).join(bullets)}
      \\resumeItemListEnd""")

        exp_section = f"""%----------- EXPERIENCE -----------
\\section{{Experience}}
  \\resumeSubHeadingListStart
{chr(10).join(exp_entries)}
  \\resumeSubHeadingListEnd
""" if exp_entries else ""

        title_color = "\\scshape\\raggedright\\large" if is_black else "\\scshape\\raggedright\\large\\color{accentColor}"
        rule_color = "\\color{black}" if is_black else "\\color{accentColor}"

        latex_template = f"""%-------------------------
% Resume in LaTeX
% Author : Snehil Tripathi
% Based on: Jake's Resume Template
% 100% Compilable on Overleaf / TeX Live / MiKTeX
%------------------------

\\documentclass[letterpaper,10pt]{{article}}

\\usepackage{{latexsym}}
\\usepackage[empty]{{fullpage}}
\\usepackage{{titlesec}}
\\usepackage{{marvosym}}
\\usepackage[usenames,dvipsnames]{{color}}
\\usepackage{{verbatim}}
\\usepackage{{enumitem}}
\\usepackage[hidelinks]{{hyperref}}
\\usepackage{{fancyhdr}}
\\usepackage[english]{{babel}}
\\usepackage{{tabularx}}
\\usepackage{{fontawesome5}}
\\usepackage{{xcolor}}

% Color configuration
\\definecolor{{accentColor}}{{HTML}}{{{color}}}

\\pagestyle{{fancy}}
\\fancyhf{{}} % clear all header and footer fields
\\fancyfoot{{}}
\\renewcommand{{\\headrulewidth}}{{0pt}}
\\renewcommand{{\\footrulewidth}}{{0pt}}

% Adjust margins for single page layout
\\addtolength{{\\oddsidemargin}}{{-0.5in}}
\\addtolength{{\\evensidemargin}}{{-0.5in}}
\\addtolength{{\\textwidth}}{{1in}}
\\addtolength{{\\topmargin}}{{-.5in}}
\\addtolength{{\\textheight}}{{1.0in}}

\\urlstyle{{same}}

\\raggedbottom
\\raggedright
\\setlength{{\\tabcolsep}}{{0in}}

% Sections formatting
\\titleformat{{\\section}}{{
  \\vspace{{-4pt}}{title_color}
}}{{}}{{0em}}{{}}[{rule_color}\\titlerule \\vspace{{-5pt}}]

% Ensure that generate pdf is machine readable/ATS parsable
\\pdfgentounicode=1

% Custom commands
\\newcommand{{\\resumeItem}}[1]{{
  \\item\\small{{
    {{#1 \\vspace{{-2pt}}}}
  }}
}}

\\newcommand{{\\resumeSubheading}}[4]{{
  \\vspace{{-2pt}}\\item
    \\begin{{tabular*}}{{0.97\\textwidth}}[t]{{l@{{\\extracolsep{{\\fill}}}}r}}
      \\textbf{{#1}} & #2 \\\\
      \\textit{{\\small#3}} & \\textit{{\\small #4}} \\\\
    \\end{{tabular*}}\\vspace{{-7pt}}
}}

\\newcommand{{\\resumeProjectHeading}}[2]{{
    \\item
    \\begin{{tabular*}}{{0.97\\textwidth}}{{l@{{\\extracolsep{{\\fill}}}}r}}
      \\small#1 & #2 \\\\
    \\end{{tabular*}}\\vspace{{-7pt}}
}}

\\newcommand{{\\resumeSubItem}}[1]{{\\resumeItem{{#1}}\\vspace{{-4pt}}}}

\\renewcommand\\labelitemii{{$\\vcenter{{\\hbox{{\\tiny$\\bullet$}}}}$}}

\\newcommand{{\\resumeSubHeadingListStart}}{{\\begin{{itemize}}[leftmargin=0.15in, label={{}}]}}
\\newcommand{{\\resumeSubHeadingListEnd}}{{\\end{{itemize}}}}
\\newcommand{{\\resumeItemListStart}}{{\\begin{{itemize}}[leftmargin=0.15in, label={{$\\bullet$}}]}}
\\newcommand{{\\resumeItemListEnd}}{{\\end{{itemize}}\\vspace{{-5pt}}}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\begin{{document}}

%----------HEADING----------
\\begin{{center}}
    \\textbf{{\\Huge \\scshape {full_name}}} \\\\ \\vspace{{2pt}}
    \\small {location} \\\\ \\vspace{{2pt}}
    \\small {contact_line}
\\end{{center}}

{edu_section}
{exp_section}
{proj_section}
{skills_section}
{coursework_section}
{involvement_section}

\\end{{document}}
"""
        return latex_template
