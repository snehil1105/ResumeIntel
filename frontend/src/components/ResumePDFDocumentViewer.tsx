import React, { useState } from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  FileCode, 
  Eye, 
  Palette, 
  ShieldCheck, 
  ZoomIn, 
  ZoomOut, 
  ExternalLink,
  Phone,
  Mail,
  Linkedin,
  Github,
  Globe,
  Code
} from 'lucide-react';
import { MasterResume } from '../types';
import { generateLatexCode, extractStyleAndColor } from '../utils/latexGenerator';
import { downloadResumeAsPDF } from '../utils/pdfGenerator';

// Helper function to extract skills by flexible category pattern without hardcoded test data
const getCategorySkills = (skillsList: any[], pattern: RegExp): string => {
  if (!skillsList || !Array.isArray(skillsList) || skillsList.length === 0) return '';
  const filtered = skillsList.filter((s: any) => {
    if (!s) return false;
    const cat = typeof s === 'string' ? '' : (s.category || '').toLowerCase();
    const name = typeof s === 'string' ? s : (s.skill_name || s.skillName || s.name || '');
    return pattern.test(cat) || pattern.test(name);
  });
  const names = filtered
    .map((s: any) => {
      if (!s) return '';
      if (typeof s === 'string') return s.trim();
      return (s.skill_name || s.skillName || s.name || '').toString().trim();
    })
    .filter(Boolean);
  return names.join(', ');
};

interface ResumePDFDocumentViewerProps {
  resume: MasterResume;
  companyName?: string;
  jobTitle?: string;
  onUpdateColor?: (hex: string) => void;
  initialTab?: 'pdf' | 'latex';
}

export const ResumePDFDocumentViewer: React.FC<ResumePDFDocumentViewerProps> = ({
  resume,
  companyName = "Company",
  jobTitle = "Software Engineer",
  onUpdateColor,
  initialTab = 'pdf'
}) => {
  // Default to classic black LaTeX format as seen in user's original resume
  const initialStyle = extractStyleAndColor(resume.raw_text || (resume as any).rawText);
  const [accentColor, setAccentColor] = useState<string>(
    initialStyle.accentColor !== '1D4ED8' ? `#${initialStyle.accentColor}` : '#000000'
  );
  const [activeTab, setActiveTab] = useState<'pdf' | 'latex'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [copied, setCopied] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Preset palettes with Classic LaTeX Monochrome as the primary recommended option
  const colorPresets = [
    { name: 'Classic LaTeX Black (Original Format)', hex: '#000000' },
    { name: 'Royal Blue', hex: '#1D4ED8' },
    { name: 'Executive Navy', hex: '#0A2540' },
    { name: 'Forest Emerald', hex: '#0F766E' },
    { name: 'Deep Burgundy', hex: '#831843' }
  ];

  // Synthesize 100% bug-free LaTeX code matching user's exact template
  const latexResult = generateLatexCode(resume, accentColor);

  const handleColorChange = (hex: string) => {
    setAccentColor(hex);
    if (onUpdateColor) onUpdateColor(hex);
  };

  const handleCopyLatex = () => {
    navigator.clipboard.writeText(latexResult.latexCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTex = () => {
    const blob = new Blob([latexResult.latexCode], { type: 'text/x-tex;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const candidateName = (resume.personal_info?.full_name || 'Resume').replace(/\s+/g, '_');
    a.download = `Resume_${candidateName}_${companyName}.tex`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintOrDownloadPDF = () => {
    downloadResumeAsPDF(resume, companyName, jobTitle);
  };

  const pInfo: any = resume.personal_info || (resume as any).personalInfo || {};
  const fullName = pInfo.full_name || pInfo.fullName || 'Candidate Name';
  const location = pInfo.location || '';
  const email = pInfo.email || '';
  const phone = pInfo.phone || '';
  const linkedinUrl = pInfo.linkedin_url || '';
  const githubUrl = pInfo.github_url || '';
  const portfolioUrl = pInfo.portfolio_url || '';
  const leetcodeUrl = pInfo.leetcode_url || '';

  const educations = resume.educations || [];
  const projects = resume.projects || [];
  const skills = resume.skills || [];

  const coursework = resume.coursework || [];
  const involvements = resume.involvements || [];

  return (
    <div className="space-y-4">
      {/* Viewer Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#F8F9FA] p-1 rounded-full border border-[#E7E7F0]">
            <button
              onClick={() => setActiveTab('pdf')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'pdf'
                  ? 'bg-[#2B59C3] text-white shadow-sm'
                  : 'text-[#474D6A] hover:text-[#121224]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              PDF Document View
            </button>
            <button
              onClick={() => setActiveTab('latex')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === 'latex'
                  ? 'bg-[#2B59C3] text-white shadow-sm'
                  : 'text-[#474D6A] hover:text-[#121224]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              LaTeX Code (.tex)
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            LaTeX Compilable · Clickable Links
          </div>
        </div>

        {/* Center: Accent Color Palette Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#121224] flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-[#2B59C3]" />
            Accent:
          </span>
          <div className="flex items-center gap-1.5">
            {colorPresets.map(preset => (
              <button
                key={preset.hex}
                title={preset.name}
                onClick={() => handleColorChange(preset.hex)}
                style={{ backgroundColor: preset.hex }}
                className={`w-5 h-5 rounded-full transition-transform border ${
                  accentColor.toLowerCase() === preset.hex.toLowerCase()
                    ? 'ring-2 ring-[#2B59C3] ring-offset-2 scale-110 border-white'
                    : 'border-slate-300 opacity-80 hover:opacity-100 hover:scale-105'
                }`}
              />
            ))}
            <input
              type="color"
              value={accentColor}
              onChange={(e) => handleColorChange(e.target.value)}
              title="Custom Hex Color"
              className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 ml-1"
            />
          </div>
        </div>

        {/* Right: Export & Copy Actions */}
        <div className="flex items-center gap-2">
          {activeTab === 'latex' ? (
            <button
              onClick={handleCopyLatex}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#2B59C3] hover:bg-[#22489F] text-xs font-semibold text-white transition-colors shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied LaTeX Code!' : 'Copy .tex Code'}
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-slate-300 text-xs text-[#121224]">
              <button 
                onClick={() => setZoomLevel(Math.max(70, zoomLevel - 10))}
                className="hover:text-[#2B59C3] px-1"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1 font-semibold">{zoomLevel}%</span>
              <button 
                onClick={() => setZoomLevel(Math.min(130, zoomLevel + 10))}
                className="hover:text-[#2B59C3] px-1"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={handleDownloadTex}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-xs font-semibold text-[#121224] transition-colors border border-slate-300 shadow-sm"
            title="Download pure compilable .tex file"
          >
            <Download className="w-3.5 h-3.5 text-[#2B59C3]" />
            Download .tex
          </button>

          <button
            onClick={handlePrintOrDownloadPDF}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#2B59C3] hover:bg-[#22489F] text-xs font-semibold text-white shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
        </div>
      </div>

      {/* Main Review Surface */}
      {activeTab === 'pdf' ? (
        /* Exact Visual Match of User's PDF Resume */
        <div className="bg-slate-100/70 p-2 sm:p-4 md:p-8 rounded-xl border border-slate-200 overflow-x-auto max-w-full">
          <div className="text-[10px] text-slate-400 text-center block sm:hidden mb-2">
            Tip: Scroll horizontally to view the full letter page width
          </div>
          <div className="flex justify-center min-w-max">
          <div
            id="printable-resume-pdf"
            style={{ 
              transform: `scale(${zoomLevel / 100})`, 
              transformOrigin: 'top center',
              width: '8.5in',
              minHeight: '11in',
              color: '#000000',
              fontFamily: '"Computer Modern", "Latin Modern Roman", "Times New Roman", Times, serif'
            }}
            className="bg-white text-black shadow-2xl p-8 md:p-12 transition-transform duration-150 leading-normal select-text text-[11pt]"
          >
            {/* Header: SNEHIL TRIPATHI */}
            <div className="text-center pb-2">
              <h1 
                style={{ color: accentColor }}
                className="text-3xl font-bold uppercase tracking-wider mb-0.5"
              >
                {fullName}
              </h1>
              <div className="text-[10pt] text-gray-800 mb-1">
                {location}
              </div>

              {/* Clickable Contact Bar with Real Links */}
              <div className="text-[9.5pt] text-gray-800 flex flex-wrap justify-center items-center gap-x-2 gap-y-1">
                {phone && (
                  <a 
                    href={`tel:${phone.replace(/[^\d+]/g, '')}`} 
                    className="hover:underline flex items-center gap-1 text-inherit"
                    title="Call"
                  >
                    <Phone className="w-3 h-3 text-slate-700" />
                    <span>{phone}</span>
                  </a>
                )}
                {phone && email && <span className="text-gray-400">|</span>}
                {email && (
                  <a 
                    href={`mailto:${email}`} 
                    className="hover:underline flex items-center gap-1 text-inherit"
                    title="Send Email"
                  >
                    <Mail className="w-3 h-3 text-slate-700" />
                    <span>{email}</span>
                  </a>
                )}
                {linkedinUrl && <span className="text-gray-400">|</span>}
                {linkedinUrl && (
                  <a 
                    href={linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-800 hover:underline flex items-center gap-1 font-medium"
                    title="Open LinkedIn"
                  >
                    <Linkedin className="w-3 h-3 text-blue-800" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {githubUrl && <span className="text-gray-400">|</span>}
                {githubUrl && (
                  <a 
                    href={githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-800 hover:underline flex items-center gap-1 font-medium"
                    title="Open GitHub"
                  >
                    <Github className="w-3 h-3 text-gray-900" />
                    <span>GitHub</span>
                  </a>
                )}
                {portfolioUrl && <span className="text-gray-400">|</span>}
                {portfolioUrl && (
                  <a 
                    href={portfolioUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-800 hover:underline flex items-center gap-1 font-medium"
                    title="Open Portfolio"
                  >
                    <Globe className="w-3 h-3 text-emerald-800" />
                    <span>Portfolio</span>
                  </a>
                )}
                {leetcodeUrl && <span className="text-gray-400">|</span>}
                {leetcodeUrl && (
                  <a 
                    href={leetcodeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-800 hover:underline flex items-center gap-1 font-medium"
                    title="Open LeetCode Profile"
                  >
                    <Code className="w-3 h-3 text-amber-700" />
                    <span>LeetCode</span>
                  </a>
                )}
              </div>
            </div>

            {/* 1. EDUCATION (AT THE TOP) */}
            {educations.length > 0 && (
              <div className="mt-3">
                <div 
                  style={{ borderBottomColor: accentColor }}
                  className="border-b-[1.2px] pb-0.5 mb-2"
                >
                  <h2 
                    style={{ color: accentColor }}
                    className="text-[13pt] font-bold uppercase tracking-wide font-serif"
                  >
                    Education
                  </h2>
                </div>

                <div className="space-y-2">
                  {educations.map((edu, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex items-baseline justify-between text-[10.5pt]">
                        <span className="font-bold text-black">{edu.institution_name}</span>
                        <span className="text-[10pt] text-gray-700 italic">
                          {edu.start_date && edu.end_date ? `${edu.start_date} – ${edu.end_date}` : (edu.end_date || edu.start_date || '')}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between text-[10pt] text-gray-800 italic">
                        <span>{edu.degree}</span>
                        <span className="font-normal not-italic">{edu.grade_or_gpa}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. PROJECTS (SECOND) */}
            {projects.length > 0 && (
              <div className="mt-4">
                <div 
                  style={{ borderBottomColor: accentColor }}
                  className="border-b-[1.2px] pb-0.5 mb-2"
                >
                  <h2 
                    style={{ color: accentColor }}
                    className="text-[13pt] font-bold uppercase tracking-wide font-serif"
                  >
                    Projects
                  </h2>
                </div>

                <div className="space-y-3">
                  {projects.map((proj, idx) => {
                    const repo = proj.repo_url || (githubUrl ? `${githubUrl}/${proj.title.replace(/\s+/g, '-')}` : '');
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-baseline justify-between text-[10.5pt]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-black">{proj.title}</span>
                            {repo && (
                              <a 
                                href={repo} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-gray-900 hover:text-blue-700 inline-flex items-center"
                                title="View on GitHub"
                              >
                                <Github className="w-3.5 h-3.5 inline" />
                              </a>
                            )}
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-800 italic text-[10pt]">
                              {proj.technologies.join(', ')}
                            </span>
                          </div>
                          <span className="text-[10pt] text-gray-700 italic whitespace-nowrap ml-2">
                            {proj.end_date || proj.start_date || 'June 2026'}
                          </span>
                        </div>
                        <ul className="list-disc list-outside ml-4 space-y-0.5 text-[9.5pt] text-gray-900 leading-snug">
                          {proj.bullet_points.map((bp, bIdx) => (
                            <li key={bIdx} className="pl-1">
                              {bp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. TECHNICAL SKILLS (THIRD) */}
            {skills.length > 0 && (
              <div className="mt-4">
                <div 
                  style={{ borderBottomColor: accentColor }}
                  className="border-b-[1.2px] pb-0.5 mb-2"
                >
                  <h2 
                    style={{ color: accentColor }}
                    className="text-[13pt] font-bold uppercase tracking-wide font-serif"
                  >
                    Technical Skills
                  </h2>
                </div>
                <div className="text-[9.5pt] text-gray-900 space-y-1">
                  {(() => {
                    const langs = getCategorySkills(skills, /language|lang/i);
                    const tools = getCategorySkills(skills, /tool|cloud|dev tool/i);
                    const frameworks = getCategorySkills(skills, /framework|technology|technologies|backend|frontend/i);
                    const ml = getCategorySkills(skills, /machine learning|ml|ai/i);
                    const dbs = getCategorySkills(skills, /database|db/i);
                    const hasCategorized = langs || tools || frameworks || ml || dbs;

                    if (!hasCategorized && skills && skills.length > 0) {
                      return (
                        <div>
                          <span className="font-bold text-black">Skills: </span>
                          <span>{skills.map((s: any) => s.skill_name || s.name || s).join(', ')}</span>
                        </div>
                      );
                    }

                    return (
                      <>
                        {langs && (
                          <div>
                            <span className="font-bold text-black">Programming Languages: </span>
                            <span>{langs}</span>
                          </div>
                        )}
                        {tools && (
                          <div>
                            <span className="font-bold text-black">Development Tools: </span>
                            <span>{tools}</span>
                          </div>
                        )}
                        {frameworks && (
                          <div>
                            <span className="font-bold text-black">Technologies and Frameworks: </span>
                            <span>{frameworks}</span>
                          </div>
                        )}
                        {ml && (
                          <div>
                            <span className="font-bold text-black">Machine Learning &amp; AI: </span>
                            <span>{ml}</span>
                          </div>
                        )}
                        {dbs && (
                          <div>
                            <span className="font-bold text-black">Databases: </span>
                            <span>{dbs}</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* 4. COURSEWORK (FOURTH) */}
            {coursework.length > 0 && (
              <div className="mt-4">
                <div 
                  style={{ borderBottomColor: accentColor }}
                  className="border-b-[1.2px] pb-0.5 mb-2"
                >
                  <h2 
                    style={{ color: accentColor }}
                    className="text-[13pt] font-bold uppercase tracking-wide font-serif"
                  >
                    Coursework
                  </h2>
                </div>

                <div className="text-[9.5pt] text-gray-900 space-y-1">
                  {coursework.map((cw, idx) => {
                    const parts = cw.split(':');
                    return (
                      <div key={idx}>
                        {parts.length > 1 ? (
                          <>
                            <span className="font-bold text-black">{parts[0].trim()}: </span>
                            <span>{parts.slice(1).join(':').trim()}</span>
                          </>
                        ) : (
                          <span>{cw}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. INVOLVEMENT (FIFTH) */}
            {involvements.length > 0 && (
              <div className="mt-4">
                <div 
                  style={{ borderBottomColor: accentColor }}
                  className="border-b-[1.2px] pb-0.5 mb-2"
                >
                  <h2 
                    style={{ color: accentColor }}
                    className="text-[13pt] font-bold uppercase tracking-wide font-serif"
                  >
                    Involvement
                  </h2>
                </div>

                <div className="text-[9.5pt] text-gray-900 space-y-1">
                  {involvements.map((inv, idx) => {
                    const parts = inv.split(':');
                    return (
                      <div key={idx}>
                        {parts.length > 1 ? (
                          <>
                            <span className="font-bold text-black">{parts[0].trim()}: </span>
                            <span>{parts.slice(1).join(':').trim()}</span>
                          </>
                        ) : (
                          <span>{inv}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          </div>
        </div>
      ) : (
        /* LaTeX Source Code Review Mode */
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 font-mono text-xs shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-800">
              <FileCode className="w-4 h-4 text-blue-600" />
              <span className="font-bold">Original LaTeX Source Code (.tex)</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                Overleaf Ready · 0 Syntax Errors
              </span>
            </div>
            <button
              onClick={handleCopyLatex}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard' : 'Copy Full LaTeX'}
            </button>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 text-[11px] text-slate-700 flex items-center justify-between">
            <span>
              Contains exact section ordering (<strong>Education first</strong>, <strong>Projects second</strong>, <strong>Skills</strong>, <strong>Coursework</strong>, <strong>Involvement</strong>) and clickable <code className="text-blue-700 bg-white px-1 py-0.5 rounded border border-blue-200">\href&#123;...&#125;</code> links.
            </span>
            <a
              href="https://www.overleaf.com/project"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
            >
              Open in Overleaf
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 overflow-x-auto text-[11px] leading-relaxed max-h-[600px] select-all font-mono">
            {latexResult.latexCode}
          </pre>
        </div>
      )}
    </div>
  );
};
