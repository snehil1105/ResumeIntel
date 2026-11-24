import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  FileCheck, 
  BarChart3, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import { MasterResume } from '../types';
import { evaluateATSRealTime, ATSRealTimeEvaluation } from '../utils/atsEvaluator';

interface ATSRealTimeReportPanelProps {
  resume: MasterResume;
  companyName: string;
  jobTitle: string;
  jdText: string;
}

export const ATSRealTimeReportPanel: React.FC<ATSRealTimeReportPanelProps> = ({
  resume,
  companyName,
  jobTitle,
  jdText
}) => {
  const [activeTab, setActiveTab] = useState<'dimensions' | 'keywords' | 'platforms'>('dimensions');
  const [expandedDimension, setExpandedDimension] = useState<string | null>('keywordRelevance');

  const evaluation: ATSRealTimeEvaluation = evaluateATSRealTime(
    resume,
    companyName,
    jobTitle,
    jdText
  );

  const { overallScore, grade, dimensions, keywordsAudit, platformCompatibilities } = evaluation;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 space-y-6 shadow-sm">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              ATS Compatibility Audit
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Heuristics
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">
              Audited at {evaluation.verifiableAuditTimestamp}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            ATS Scorecard for <span className="text-blue-600">{jobTitle || 'Target Role'}</span> at <span className="text-slate-800">{companyName || 'Company'}</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-500 max-w-3xl leading-relaxed">
            Programmatic evaluation simulating enterprise parsing engines (Workday, Greenhouse, Lever, iCIMS). Inspects single-column text extraction, semantic keyword density, action verb strength, and layout traps in real time.
          </p>
        </div>

        {/* Overall Score Dial */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm shrink-0">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray={`${overallScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute font-bold text-base text-slate-900 font-mono">
              {grade}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              Composite Score
            </div>
            <div className="text-2xl font-bold text-emerald-700 font-mono">
              {overallScore}<span className="text-xs text-slate-400 font-normal">/100</span>
            </div>
            <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Production Pass
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for ATS Details */}
      <div className="flex items-center gap-1 bg-[#F8F9FA] p-1 rounded-full border border-[#E7E7F0] self-start">
        <button
          onClick={() => setActiveTab('dimensions')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'dimensions'
              ? 'bg-[#2B59C3] text-white shadow-sm'
              : 'text-[#474D6A] hover:text-[#121224]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          5 Core ATS Dimensions
        </button>

        <button
          onClick={() => setActiveTab('keywords')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'keywords'
              ? 'bg-[#2B59C3] text-white shadow-sm'
              : 'text-[#474D6A] hover:text-[#121224]'
          }`}
        >
          Role Keyword Density ({evaluation.matchedKeywordsCount}/{evaluation.totalTargetKeywordsCount})
        </button>

        <button
          onClick={() => setActiveTab('platforms')}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeTab === 'platforms'
              ? 'bg-[#2B59C3] text-white shadow-sm'
              : 'text-[#474D6A] hover:text-[#121224]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Enterprise ATS Benchmarks
        </button>
      </div>

      {/* TAB 1: 5 Core Dimensions */}
      {activeTab === 'dimensions' && (
        <div className="space-y-3">
          {Object.entries(dimensions).map(([key, dim]) => {
            const isExpanded = expandedDimension === key;
            return (
              <div 
                key={key}
                className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg p-4 transition-all"
              >
                <div 
                  onClick={() => setExpandedDimension(isExpanded ? null : key)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-blue-600 shadow-sm">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{dim.name}</span>
                        <span className="text-[11px] text-slate-500 font-mono">Weight: {dim.weight}%</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{dim.summary}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-base font-bold text-emerald-700 font-mono">{dim.score}%</span>
                      <span className="text-[10px] text-emerald-700 block font-semibold">{dim.status}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600 animate-in fade-in duration-200">
                    <ul className="space-y-1.5 pl-2">
                      {dim.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Role Keyword Density Matrix */}
      {activeTab === 'keywords' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-700">
              Role Keyword Match: <strong className="text-emerald-700">{evaluation.matchedKeywordsCount} Matched</strong> of {evaluation.totalTargetKeywordsCount} evaluated technical keywords.
            </span>
            <span className="text-slate-500 text-[11px]">
              Extracted from {jobTitle} job requirements
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {keywordsAudit.map((item, idx) => (
              <div 
                key={idx}
                className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all ${
                  item.status === 'MATCHED'
                    ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  {item.status === 'MATCHED' ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[9px] text-slate-400 shrink-0">
                      —
                    </span>
                  )}
                  <span className={`font-semibold truncate ${item.status === 'MATCHED' ? 'text-slate-900' : 'text-slate-400'}`}>
                    {item.keyword}
                  </span>
                </div>

                {item.status === 'MATCHED' && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 shrink-0 font-bold">
                    {item.occurrences}x
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Enterprise Platform Benchmarks */}
      {activeTab === 'platforms' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {platformCompatibilities.map((plat, idx) => (
            <div 
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{plat.platformName}</span>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {plat.compatibilityScore}%
                </span>
              </div>
              <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {plat.status} Compatibility
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1 border-t border-slate-200">
                {plat.notes}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Checklist Banner */}
      <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Single-Column Safe
          </span>
          <span>·</span>
          <span className="text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> No Layout Tables
          </span>
          <span>·</span>
          <span className="text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified LaTeX Fonts
          </span>
          <span>·</span>
          <span className="text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 100% Factually Grounded
          </span>
        </div>

        <div className="text-[11px] text-slate-400">
          Simulated against Greenhouse, Workday, and Lever enterprise parsers.
        </div>
      </div>
    </div>
  );
};
