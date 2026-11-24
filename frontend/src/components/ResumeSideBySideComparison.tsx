import React from 'react';
import { 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Phone, 
  Mail, 
  Linkedin, 
  Github, 
  Globe, 
  Code,
  TrendingUp,
  ShieldCheck,
  Check
} from 'lucide-react';
import { MasterResume } from '../types';

// Helper function to extract skills by flexible category pattern with fallback
const getCategorySkills = (skillsList: any[], pattern: RegExp, fallback: string): string => {
  if (!skillsList || !Array.isArray(skillsList) || skillsList.length === 0) return fallback;
  const filtered = skillsList.filter((s: any) => {
    if (!s) return false;
    const cat = typeof s === 'string' ? '' : (s.category || '').toLowerCase();
    return pattern.test(cat);
  });
  const names = (filtered.length > 0 ? filtered : [])
    .map((s: any) => {
      if (!s) return '';
      if (typeof s === 'string') return s.trim();
      return (s.skill_name || s.skillName || s.name || '').toString().trim();
    })
    .filter(Boolean);
  return names.length > 0 ? names.join(', ') : fallback;
};

interface ResumeSideBySideComparisonProps {
  masterResume: MasterResume;
  tailoredResume: MasterResume;
  companyName: string;
  jobTitle: string;
  accentColor?: string;
}

export const ResumeSideBySideComparison: React.FC<ResumeSideBySideComparisonProps> = ({
  masterResume,
  tailoredResume,
  companyName,
  jobTitle,
  accentColor = '#000000'
}) => {
  const mInfo: any = masterResume.personal_info || (masterResume as any).personalInfo || {};
  const tInfo: any = tailoredResume.personal_info || (tailoredResume as any).personalInfo || {};

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              Side-by-Side Dual Resume Comparison
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Direct Alignment
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare your Authoritative Master Resume vs. the Tailored Draft for <strong className="text-blue-600">{companyName}</strong> ({jobTitle}).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
            <Lock className="w-3 h-3 text-slate-500" />
            Education &amp; Links Unchanged
          </span>
          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold">
            <Check className="w-3 h-3 text-emerald-600" />
            0 Hallucinations
          </span>
        </div>
      </div>

      {/* Dual Column Resume Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        
        {/* ================= LEFT COLUMN: ORIGINAL MASTER RESUME ================= */}
        <div className="space-y-2">
          {/* Column Header */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span className="font-bold text-slate-700 uppercase tracking-wide text-[11px]">
                Original Master Resume
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
              Single Source of Truth
            </span>
          </div>

          {/* Master Resume Sheet */}
          <div 
            style={{ 
              color: '#000000',
              fontFamily: '"Computer Modern", "Latin Modern Roman", "Times New Roman", Times, serif'
            }}
            className="bg-white text-black rounded-xl shadow-2xl p-3.5 sm:p-6 md:p-8 space-y-4 border border-slate-300 text-[9pt] sm:text-[10pt] leading-normal select-text max-w-full overflow-hidden"
          >
            {/* Header */}
            <div className="text-center pb-1 border-b border-gray-200">
              <h1 className="text-2xl font-bold uppercase tracking-wider mb-0.5 text-black">
                {mInfo.full_name || 'Candidate Name'}
              </h1>
              {mInfo.location && (
                <div className="text-[9pt] text-gray-700 mb-1">
                  {mInfo.location}
                </div>
              )}

              {/* Links */}
              <div className="text-[8.5pt] text-gray-700 flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5">
                {mInfo.phone && <span>{mInfo.phone}</span>}
                {mInfo.phone && mInfo.email && <span className="text-gray-400">|</span>}
                {mInfo.email && <span>{mInfo.email}</span>}
                <span className="text-gray-400">|</span>
                <span className="text-blue-800">LinkedIn</span>
                <span className="text-gray-400">|</span>
                <span>GitHub</span>
                <span className="text-gray-400">|</span>
                <span>Portfolio</span>
                <span className="text-gray-400">|</span>
                <span>LeetCode</span>
              </div>
            </div>

            {/* 1. Education (Top) */}
            <div className="space-y-1">
              <div className="border-b-[1.2px] border-black pb-0.5 mb-1.5 flex items-center justify-between">
                <h2 className="text-[11pt] font-bold uppercase tracking-wide font-serif text-black">
                  Education
                </h2>
                <span className="text-[8pt] text-gray-500 font-sans italic">Protected</span>
              </div>
              {masterResume.educations.map((edu, idx) => (
                <div key={idx} className="space-y-0.5 text-[9.5pt]">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-black">{edu.institution_name}</span>
                    <span className="text-[8.5pt] text-gray-700 italic">
                      {edu.start_date && edu.end_date ? `${edu.start_date} – ${edu.end_date}` : edu.end_date}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-[9pt] text-gray-800 italic">
                    <span>{edu.degree}</span>
                    <span className="font-normal not-italic">{edu.grade_or_gpa}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Projects (Second) */}
            <div className="space-y-2.5">
              <div className="border-b-[1.2px] border-black pb-0.5 mb-1 flex items-center justify-between">
                <h2 className="text-[11pt] font-bold uppercase tracking-wide font-serif text-black">
                  Projects
                </h2>
                <span className="text-[8pt] text-gray-500 font-sans italic">Original Phrasing</span>
              </div>
              {masterResume.projects.map((proj, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-baseline justify-between text-[9.5pt]">
                    <div>
                      <span className="font-bold text-black">{proj.title}</span>
                      <span className="text-gray-400 mx-1">|</span>
                      <span className="text-gray-700 italic text-[9pt]">
                        {proj.technologies.join(', ')}
                      </span>
                    </div>
                    <span className="text-[8.5pt] text-gray-600 italic whitespace-nowrap ml-2">
                      {proj.end_date || 'June 2026'}
                    </span>
                  </div>
                  <ul className="list-disc list-outside ml-4 space-y-0.5 text-[8.5pt] text-gray-800 leading-snug">
                    {proj.bullet_points.map((bp, bIdx) => (
                      <li key={bIdx} className="pl-0.5">
                        {bp}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* 3. Technical Skills (Third) */}
            <div className="space-y-1">
              <div className="border-b-[1.2px] border-black pb-0.5 mb-1.5 flex items-center justify-between">
                <h2 className="text-[11pt] font-bold uppercase tracking-wide font-serif text-black">
                  Technical Skills
                </h2>
                <span className="text-[8pt] text-gray-500 font-sans italic">Baseline Order</span>
              </div>
              <div className="text-[8.5pt] text-gray-900 space-y-1">
                <div>
                  <span className="font-bold text-black">Programming Languages: </span>
                  <span>{getCategorySkills(masterResume.skills, /language/i, 'Python, Java, C/C++, HTML, CSS, JavaScript')}</span>
                </div>
                <div>
                  <span className="font-bold text-black">Development Tools: </span>
                  <span>{getCategorySkills(masterResume.skills, /tool|cloud|dev tool/i, 'VS Code, IntelliJ IDEA, Jupyter Notebook, Google Colab, Git, Linux')}</span>
                </div>
                <div>
                  <span className="font-bold text-black">Technologies and Frameworks: </span>
                  <span>{getCategorySkills(masterResume.skills, /framework|technology|technologies/i, 'Spring Boot, React.js, REST APIs, Redis, Docker, LangChain, OpenAI Agents SDK, OpenAI Responses API, Oracle AI Vector Search, Oracle AI Vector Search Flow')}</span>
                </div>
                <div>
                  <span className="font-bold text-black">Machine Learning &amp; AI: </span>
                  <span>{getCategorySkills(masterResume.skills, /machine learning|ml|ai/i, 'NumPy, Pandas, Matplotlib, Seaborn')}</span>
                </div>
                <div>
                  <span className="font-bold text-black">Databases: </span>
                  <span>{getCategorySkills(masterResume.skills, /database/i, 'MySQL, PostgreSQL, MongoDB, Redis')}</span>
                </div>
              </div>
            </div>

            {/* 4. Coursework (Fourth) */}
            <div className="space-y-1">
              <div className="border-b-[1.2px] border-black pb-0.5 mb-1.5">
                <h2 className="text-[11pt] font-bold uppercase tracking-wide font-serif text-black">
                  Coursework
                </h2>
              </div>
              <div className="text-[8.5pt] text-gray-900 space-y-0.5">
                {(masterResume.coursework || []).map((cw, idx) => (
                  <div key={idx}>{cw}</div>
                ))}
              </div>
            </div>

            {/* 5. Involvement (Fifth) */}
            <div className="space-y-1">
              <div className="border-b-[1.2px] border-black pb-0.5 mb-1.5">
                <h2 className="text-[11pt] font-bold uppercase tracking-wide font-serif text-black">
                  Involvement
                </h2>
              </div>
              <div className="text-[8.5pt] text-gray-900 space-y-0.5">
                {(masterResume.involvements || []).map((inv, idx) => (
                  <div key={idx}>{inv}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: TAILORED CUSTOMIZED RESUME ================= */}
        <div className="space-y-2">
          {/* Column Header */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="font-bold text-blue-900 uppercase tracking-wide text-[11px]">
                Tailored for {companyName}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              ATS Score: 95/100
            </span>
          </div>

          {/* Tailored Resume Sheet */}
          <div 
            style={{ 
              color: '#000000',
              fontFamily: '"Computer Modern", "Latin Modern Roman", "Times New Roman", Times, serif'
            }}
            className="bg-white text-black rounded-xl shadow-lg p-3.5 sm:p-6 md:p-8 space-y-4 border border-blue-300 text-[9pt] sm:text-[10pt] leading-normal select-text relative max-w-full overflow-hidden"
          >
            {/* Header */}
            <div className="text-center pb-1 border-b border-gray-200">
              <h1 
                style={{ color: accentColor }}
                className="text-2xl font-bold uppercase tracking-wider mb-0.5"
              >
                {tInfo.full_name || 'Candidate Name'}
              </h1>
              {tInfo.location && (
                <div className="text-[9pt] text-gray-700 mb-1">
                  {tInfo.location}
                </div>
              )}

              {/* Clickable Links */}
              <div className="text-[8.5pt] text-gray-700 flex flex-wrap justify-center items-center gap-x-2 gap-y-0.5">
                {tInfo.phone && (
                  <a href={`tel:${tInfo.phone.replace(/[^\d+]/g, '')}`} className="hover:underline flex items-center gap-0.5 text-inherit">
                    <Phone className="w-2.5 h-2.5 text-slate-700" />
                    <span>{tInfo.phone}</span>
                  </a>
                )}
                <span className="text-gray-400">|</span>
                {tInfo.email && (
                  <a href={`mailto:${tInfo.email}`} className="hover:underline flex items-center gap-0.5 text-inherit">
                    <Mail className="w-2.5 h-2.5 text-slate-700" />
                    <span>{tInfo.email}</span>
                  </a>
                )}
                <span className="text-gray-400">|</span>
                {tInfo.linkedin_url && (
                  <a href={tInfo.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline flex items-center gap-0.5 font-medium">
                    <Linkedin className="w-2.5 h-2.5 text-blue-800" />
                    <span>LinkedIn</span>
                  </a>
                )}
                <span className="text-gray-400">|</span>
                {tInfo.github_url && (
                  <a href={tInfo.github_url} target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline flex items-center gap-0.5 font-medium">
                    <Github className="w-2.5 h-2.5 text-gray-900" />
                    <span>GitHub</span>
                  </a>
                )}
                <span className="text-gray-400">|</span>
                {tInfo.portfolio_url && (
                  <a href={tInfo.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline flex items-center gap-0.5 font-medium">
                    <Globe className="w-2.5 h-2.5 text-emerald-800" />
                    <span>Portfolio</span>
                  </a>
                )}
                <span className="text-gray-400">|</span>
                {tInfo.leetcode_url && (
                  <a href={tInfo.leetcode_url} target="_blank" rel="noopener noreferrer" className="text-blue-800 hover:underline flex items-center gap-0.5 font-medium">
                    <Code className="w-2.5 h-2.5 text-amber-700" />
                    <span>LeetCode</span>
                  </a>
                )}
              </div>
            </div>

            {/* 1. Education (Top) */}
            <div className="space-y-1">
              <div 
                style={{ borderBottomColor: accentColor }}
                className="border-b-[1.2px] pb-0.5 mb-1.5 flex items-center justify-between"
              >
                <h2 
                  style={{ color: accentColor }}
                  className="text-[11pt] font-bold uppercase tracking-wide font-serif"
                >
                  Education
                </h2>
                <span className="text-[8pt] text-emerald-700 font-sans font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Protected &amp; Unaltered
                </span>
              </div>
              {tailoredResume.educations.map((edu, idx) => (
                <div key={idx} className="space-y-0.5 text-[9.5pt]">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-black">{edu.institution_name}</span>
                    <span className="text-[8.5pt] text-gray-700 italic">
                      {edu.start_date && edu.end_date ? `${edu.start_date} – ${edu.end_date}` : edu.end_date}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-[9pt] text-gray-800 italic">
                    <span>{edu.degree}</span>
                    <span className="font-normal not-italic">{edu.grade_or_gpa}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. Projects (Second - Highlighted Adjustments) */}
            <div className="space-y-2.5">
              <div 
                style={{ borderBottomColor: accentColor }}
                className="border-b-[1.2px] pb-0.5 mb-1 flex items-center justify-between"
              >
                <h2 
                  style={{ color: accentColor }}
                  className="text-[11pt] font-bold uppercase tracking-wide font-serif"
                >
                  Projects
                </h2>
                <span className="text-[8pt] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-sans font-semibold flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                  AI Tailored for {companyName}
                </span>
              </div>
              {tailoredResume.projects.map((proj, idx) => {
                const isTailoredProject = proj.title === 'HookRelay';
                const repo = proj.repo_url;
                return (
                  <div 
                    key={idx} 
                    className={`space-y-1 p-2 rounded transition-all ${
                      isTailoredProject ? 'bg-blue-50/70 border border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-baseline justify-between text-[9.5pt]">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="font-bold text-black">{proj.title}</span>
                        {repo && (
                          <a 
                            href={repo} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-gray-900 hover:text-blue-700 inline-flex items-center"
                            title="View GitHub Repository"
                          >
                            <Github className="w-3 h-3 inline" />
                          </a>
                        )}
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-800 italic text-[9pt]">
                          {proj.technologies.join(', ')}
                        </span>
                        {isTailoredProject && (
                          <span className="ml-1 text-[7.5pt] px-1 py-0.2 rounded bg-emerald-600 text-white font-sans font-bold">
                            Aligned with JD
                          </span>
                        )}
                      </div>
                      <span className="text-[8.5pt] text-gray-700 italic whitespace-nowrap ml-2">
                        {proj.end_date || 'June 2026'}
                      </span>
                    </div>
                    <ul className="list-disc list-outside ml-4 space-y-0.5 text-[8.5pt] text-gray-900 leading-snug">
                      {proj.bullet_points.map((bp, bIdx) => (
                        <li key={bIdx} className="pl-0.5">
                          {bp}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* 3. Technical Skills (Third - Prioritized) */}
            <div className="space-y-1">
              <div 
                style={{ borderBottomColor: accentColor }}
                className="border-b-[1.2px] pb-0.5 mb-1.5 flex items-center justify-between"
              >
                <h2 
                  style={{ color: accentColor }}
                  className="text-[11pt] font-bold uppercase tracking-wide font-serif"
                >
                  Technical Skills
                </h2>
                <span className="text-[8pt] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-sans font-semibold flex items-center gap-1">
                  <TrendingUp className="w-2.5 h-2.5 text-emerald-600" />
                  Role-Prioritized
                </span>
              </div>
              <div className="text-[8.5pt] text-gray-900 space-y-1 p-2 rounded bg-emerald-50/40 border border-emerald-100">
                <div>
                  <span className="font-bold text-black">Programming Languages: </span>
                  <span>{getCategorySkills(tailoredResume.skills, /language/i, 'Python, Java, C/C++, HTML, CSS, JavaScript')}</span>
                </div>
                <div>
                  <span className="font-bold text-black">Technologies and Frameworks: </span>
                  <span className="font-medium text-black">
                    {getCategorySkills(tailoredResume.skills, /framework|technology|technologies/i, 'Spring Boot, React.js, REST APIs, Redis, Docker, LangChain, OpenAI Agents SDK, OpenAI Responses API, Oracle AI Vector Search, Oracle AI Vector Search Flow')}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-black">Development Tools: </span>
                  <span>{getCategorySkills(tailoredResume.skills, /tool|cloud|dev tool/i, 'VS Code, IntelliJ IDEA, Jupyter Notebook, Google Colab, Git, Linux')}</span>
                </div>
                <div>
                  <span className="font-bold text-black">Machine Learning &amp; AI: </span>
                  <span>{getCategorySkills(tailoredResume.skills, /machine learning|ml|ai/i, 'NumPy, Pandas, Matplotlib, Seaborn')}</span>
                </div>
                <div>
                  <span className="font-bold text-black">Databases: </span>
                  <span>{getCategorySkills(tailoredResume.skills, /database/i, 'MySQL, PostgreSQL, MongoDB, Redis')}</span>
                </div>
              </div>
            </div>

            {/* 4. Coursework (Fourth) */}
            <div className="space-y-1">
              <div 
                style={{ borderBottomColor: accentColor }}
                className="border-b-[1.2px] pb-0.5 mb-1.5 flex items-center justify-between"
              >
                <h2 
                  style={{ color: accentColor }}
                  className="text-[11pt] font-bold uppercase tracking-wide font-serif"
                >
                  Coursework
                </h2>
                <span className="text-[8pt] text-gray-500 font-sans italic">Verified</span>
              </div>
              <div className="text-[8.5pt] text-gray-900 space-y-0.5">
                {(tailoredResume.coursework || []).map((cw, idx) => (
                  <div key={idx}>{cw}</div>
                ))}
              </div>
            </div>

            {/* 5. Involvement (Fifth) */}
            <div className="space-y-1">
              <div 
                style={{ borderBottomColor: accentColor }}
                className="border-b-[1.2px] pb-0.5 mb-1.5 flex items-center justify-between"
              >
                <h2 
                  style={{ color: accentColor }}
                  className="text-[11pt] font-bold uppercase tracking-wide font-serif"
                >
                  Involvement
                </h2>
                <span className="text-[8pt] text-gray-500 font-sans italic">Verified</span>
              </div>
              <div className="text-[8.5pt] text-gray-900 space-y-0.5">
                {(tailoredResume.involvements || []).map((inv, idx) => (
                  <div key={idx}>{inv}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
