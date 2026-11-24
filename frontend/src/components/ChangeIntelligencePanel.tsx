import React from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  Columns, 
  FileText, 
  FileCode, 
  Info, 
  Lock, 
  Layers,
  TrendingUp,
  Award
} from 'lucide-react';

export interface DetailedChangeItem {
  id: string;
  title: string;
  section: 'PROJECTS' | 'SKILLS' | 'KEYWORDS';
  targetTitle: string;
  beforeSnippet: string;
  afterSnippet: string;
  whyChanged: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceType: string;
  confidenceScore: number;
  factualStatus: string;
}

interface ChangeIntelligencePanelProps {
  changes: DetailedChangeItem[];
  companyName: string;
  jobTitle: string;
  activeView: 'side_by_side' | 'pdf' | 'latex';
  onChangeView: (view: 'side_by_side' | 'pdf' | 'latex') => void;
  selectedChangeId?: string | null;
  onSelectChange?: (id: string) => void;
}

export const ChangeIntelligencePanel: React.FC<ChangeIntelligencePanelProps> = ({
  changes,
  companyName,
  jobTitle,
  activeView,
  onChangeView,
  selectedChangeId,
  onSelectChange
}) => {
  return (
    <div className="bg-white border border-[#E7E7F0] rounded-2xl p-5 space-y-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col h-full">
      {/* Top Header */}
      <div className="space-y-1.5 border-b border-[#E7E7F0] pb-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F2F5FB] text-[#2B59C3] border border-[#D3E0FD] uppercase tracking-wider">
            Tailoring Details
          </span>
          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verified Truth
          </span>
        </div>

        <h3 className="text-base font-bold text-[#121224] tracking-tight">
          What Changed &amp; Why
        </h3>
        <p className="text-xs text-[#474D6A] leading-relaxed font-normal">
          Detailed breakdown of every optimization for <strong className="text-[#121224] font-semibold">{companyName}</strong>.
        </p>
      </div>

      {/* View Mode Switcher */}
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8292B0] block">
          Document View:
        </span>
        <div className="grid grid-cols-3 gap-1 bg-[#F8F9FA] p-1 rounded-xl border border-[#E7E7F0] text-xs font-semibold">
          <button
            onClick={() => onChangeView('side_by_side')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
              activeView === 'side_by_side'
                ? 'bg-[#2B59C3] text-white shadow-sm'
                : 'text-[#474D6A] hover:text-[#121224]'
            }`}
          >
            <Columns className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Side-by-Side</span>
          </button>

          <button
            onClick={() => onChangeView('pdf')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
              activeView === 'pdf'
                ? 'bg-[#2B59C3] text-white shadow-sm'
                : 'text-[#474D6A] hover:text-[#121224]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">PDF View</span>
          </button>

          <button
            onClick={() => onChangeView('latex')}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg transition-all ${
              activeView === 'latex'
                ? 'bg-[#2B59C3] text-white shadow-sm'
                : 'text-[#474D6A] hover:text-[#121224]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">LaTeX .tex</span>
          </button>
        </div>
      </div>

      {/* Changes Summary Count Badge */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <Layers className="w-4 h-4 text-blue-600" />
          <span>{changes.length} Tailored Adjustments</span>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          0 Fabrications
        </span>
      </div>

      {/* List of Detailed Change Cards */}
      <div className="space-y-3.5 overflow-y-auto pr-1 flex-1 max-h-[720px]">
        {changes.map((item, idx) => {
          const isSelected = selectedChangeId === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onSelectChange && onSelectChange(item.id)}
              className={`p-4 rounded-xl border transition-all text-xs space-y-3 cursor-pointer shadow-sm ${
                isSelected
                  ? 'bg-blue-50/50 border-blue-400 ring-1 ring-blue-400'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              {/* Card Title & Section Tag */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {item.section} · {item.targetTitle}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 mt-1 text-[13px] leading-snug">
                    {item.title}
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                  {Math.round(item.confidenceScore * 100)}% Match
                </span>
              </div>

              {/* What Changed: Before vs After Diff */}
              <div className="space-y-1.5 pt-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-blue-600" />
                  What Changed (Diff):
                </span>
                <div className="space-y-1 text-[11px] leading-relaxed">
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
                    <span className="font-bold text-rose-700 text-[10px] block">Original Master:</span>
                    <p className="line-through opacity-80 mt-0.5 font-sans">{item.beforeSnippet}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                    <span className="font-bold text-emerald-700 text-[10px] block">Tailored for {companyName}:</span>
                    <p className="mt-0.5 font-medium font-sans">{item.afterSnippet}</p>
                  </div>
                </div>
              </div>

              {/* Why Changed */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                  <Info className="w-3 h-3 text-amber-600" />
                  Role Rationale:
                </span>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {item.whyChanged}
                </p>
              </div>

              {/* Source is Required */}
              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-800 flex items-center gap-1">
                    <Award className="w-3 h-3 text-blue-600" />
                    Reference:
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                    {item.sourceType}
                  </span>
                </div>

                <div className="text-[11px] text-slate-700 font-medium">
                  {item.sourceTitle}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-blue-200 text-[10px]">
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 font-semibold"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>Inspect Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {item.factualStatus}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Protected Master Guard Reminder */}
      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 space-y-0.5">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span>Factual Truth Protected</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-normal">
          Education, contact info, coursework, and extracurriculars remain 100% authentic and unaltered.
        </p>
      </div>
    </div>
  );
};
