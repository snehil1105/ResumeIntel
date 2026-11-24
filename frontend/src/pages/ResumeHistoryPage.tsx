import React from 'react';
import { History, FileDown, GitBranch, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ProtectedBadge } from '../components/ProtectedBadge';

interface ResumeHistoryPageProps {
  onNavigate: (tab: string) => void;
}

export const ResumeHistoryPage: React.FC<ResumeHistoryPageProps> = ({ onNavigate }) => {
  const versions = [
    {
      id: "ver-1",
      companyName: "Google",
      jobTitle: "Software Engineering Intern - Backend",
      versionTag: "Google - Backend Intern - v1",
      createdAt: "2026-11-17",
      atsScore: 92,
      approvedChanges: 2,
      summary: "STAR optimized backend project bullets, prioritized Java & Spring Boot, tailored distributed systems summary."
    },
    {
      id: "ver-2",
      companyName: "Microsoft",
      jobTitle: "Cloud & AI Software Engineer Intern",
      versionTag: "Microsoft - Cloud AI - v1",
      createdAt: "2026-11-15",
      atsScore: 89,
      approvedChanges: 3,
      summary: "Highlighted FastAPI RAG document intelligence pipeline and LangChain embeddings."
    },
    {
      id: "ver-3",
      companyName: "Amazon",
      jobTitle: "Software Development Engineer Intern (AWS)",
      versionTag: "Amazon - SDE Intern - v1",
      createdAt: "2026-11-12",
      atsScore: 88,
      approvedChanges: 2,
      summary: "Emphasized microservices decomposition, Docker containerization, and PostgreSQL query optimizations."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Resume Version Management Tree</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Every job application generates an independent, isolated resume branch. Customizing for one company never modifies another version or the Master Resume.
          </p>
        </div>

        <button
          onClick={() => onNavigate('master_resume')}
          className="px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
        >
          View Master Resume Baseline
        </button>
      </div>

      {/* Version Tree Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-950 border border-amber-500/30">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
            <GitBranch className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Master Resume Baseline (v1)</h3>
              <ProtectedBadge label="Root Source of Truth" />
            </div>
            <p className="text-xs text-slate-400">Authoritative verified resume holding candidate facts and credentials.</p>
          </div>
        </div>

        {/* Tree Branches */}
        <div className="pl-6 border-l-2 border-slate-800 space-y-4 ml-5">
          {versions.map((ver) => (
            <div 
              key={ver.id}
              className="relative p-5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-all space-y-3"
            >
              {/* Branch indicator node */}
              <div className="absolute -left-[31px] top-6 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-900" />

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{ver.companyName}</span>
                    <span className="text-xs text-slate-400">• {ver.jobTitle}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {ver.versionTag}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" /> Created: {ver.createdAt}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    ATS Score: {ver.atsScore}/100
                  </span>
                  <button
                    onClick={() => onNavigate('resume_studio')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5 text-blue-400" />
                    Download PDF / DOCX
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {ver.summary}
              </p>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{ver.approvedChanges} Human-Approved Modifications Incorporated</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
