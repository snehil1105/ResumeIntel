import React from 'react';
import { MasterResume, ChangeProposal } from '../types';
import { ProtectedBadge } from './ProtectedBadge';
import { FileDown, CheckCircle, Shield, Sparkles } from 'lucide-react';

interface SideBySideDiffProps {
  masterResume: MasterResume;
  customizedResume: MasterResume;
  proposals: ChangeProposal[];
  companyName: string;
  jobTitle: string;
  onExportPDF: () => void;
  onExportDOCX: () => void;
}

export const SideBySideDiff: React.FC<SideBySideDiffProps> = ({
  masterResume,
  customizedResume,
  proposals,
  companyName,
  jobTitle,
  onExportPDF,
  onExportDOCX
}) => {
  const approvedCount = proposals.filter(p => p.approval_status === 'APPROVED' || p.approval_status === 'EDITED').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Side-by-Side Resume Diff &amp; Verification</h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {approvedCount} Approved Changes Merged
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comparing Authoritative Master Resume vs. Customized Draft for <strong className="text-blue-400">{companyName}</strong> ({jobTitle})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExportDOCX}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <FileDown className="w-4 h-4 text-blue-400" />
            Download DOCX
          </button>
          <button
            onClick={onExportPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow-sm shadow-blue-500/20"
          >
            <FileDown className="w-4 h-4" />
            Export ATS PDF
          </button>
        </div>
      </div>

      {/* Side-by-Side Dual View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Authoritative Master Resume */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Single Source of Truth</span>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Original Master Resume
                <span className="text-xs font-normal text-slate-400">v{masterResume.version_number || 1}</span>
              </h3>
            </div>
            <ProtectedBadge label="Immutable Guard" />
          </div>

          {/* Contact (Protected) */}
          <div className="p-4 rounded-lg bg-slate-950/60 border border-amber-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-100">{masterResume.personal_info.full_name}</h4>
              <ProtectedBadge label="Protected" />
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {masterResume.personal_info.email} | {masterResume.personal_info.phone || 'Phone'} | {masterResume.personal_info.location}
            </p>
          </div>

          {/* Professional Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Professional Summary</h4>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800">
              {masterResume.professional_summary}
            </p>
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Technical Skills</h4>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-slate-950/40 border border-slate-800">
              {masterResume.skills.map((s) => (
                <span key={s.id} className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                  {s.skill_name}
                </span>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projects</h4>
            {masterResume.projects.map((p) => (
              <div key={p.id} className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{p.title}</span>
                  <span className="text-[10px] text-slate-500">{p.technologies.slice(0, 3).join(', ')}</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-300">
                  {p.bullet_points.map((b, idx) => (
                    <li key={idx} className="leading-relaxed">{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Educations (Protected) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Education</h4>
              <ProtectedBadge label="Protected" />
            </div>
            {masterResume.educations.map((edu) => (
              <div key={edu.id} className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-slate-200">{edu.institution_name}</span> — {edu.degree}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Tailored Customized Resume */}
        <div className="bg-slate-900 border border-blue-500/30 rounded-xl p-6 space-y-6 shadow-lg shadow-blue-500/5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Targeted Application Version</span>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Customized for {companyName}
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">ATS Ready</span>
              </h3>
            </div>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle className="w-3.5 h-3.5" /> Factual Verified
            </span>
          </div>

          {/* Contact (Protected Unchanged) */}
          <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-100">{customizedResume.personal_info.full_name}</h4>
              <ProtectedBadge label="Unchanged" />
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {customizedResume.personal_info.email} | {customizedResume.personal_info.phone || 'Phone'} | {customizedResume.personal_info.location}
            </p>
          </div>

          {/* Professional Summary (Tailored & Highlighted) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Tailored Professional Summary
              </h4>
              <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10">Approved</span>
            </div>
            <p className="text-xs text-blue-100 leading-relaxed bg-blue-950/20 p-3 rounded-lg border border-blue-500/30">
              {customizedResume.professional_summary}
            </p>
          </div>

          {/* Skills (Re-ranked for Target Role) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Prioritized Technical Skills</h4>
              <span className="text-[10px] text-blue-400 font-semibold px-1.5 py-0.5 rounded bg-blue-500/10">Reordered</span>
            </div>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-blue-950/10 border border-blue-500/20">
              {customizedResume.skills.map((s) => (
                <span key={s.id} className="px-2 py-0.5 rounded text-[11px] bg-blue-900/30 text-blue-200 border border-blue-500/30">
                  {s.skill_name}
                </span>
              ))}
            </div>
          </div>

          {/* Projects (Optimized Bullets) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">STAR-Optimized Projects</h4>
            {customizedResume.projects.map((p) => (
              <div key={p.id} className="p-3.5 rounded-lg bg-blue-950/10 border border-blue-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">{p.title}</span>
                  <span className="text-[10px] text-blue-300">{p.technologies.slice(0, 3).join(', ')}</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-blue-100">
                  {p.bullet_points.map((b, idx) => (
                    <li key={idx} className="leading-relaxed">{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Education (Protected Unchanged) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Education</h4>
              <ProtectedBadge label="Unchanged" />
            </div>
            {customizedResume.educations.map((edu) => (
              <div key={edu.id} className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-slate-200">{edu.institution_name}</span> — {edu.degree}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
