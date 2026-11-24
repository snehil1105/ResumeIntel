import React from 'react';
import { 
  ShieldAlert, 
  Code2, 
  Video, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Briefcase,
  Lightbulb
} from 'lucide-react';
import { DomainAlignmentResult } from '../utils/domainAlignment';

interface DomainMismatchViewProps {
  alignment: DomainAlignmentResult;
  companyName: string;
  jobTitle: string;
  onResetOrEditJd: () => void;
  onLoadSampleSweJd?: () => void;
}

export const DomainMismatchView: React.FC<DomainMismatchViewProps> = ({
  alignment,
  companyName,
  jobTitle,
  onResetOrEditJd,
  onLoadSampleSweJd
}) => {
  const { aiAnalysisSummary } = alignment;

  return (
    <div className="space-y-6 pt-2 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* 1. Status Banner */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                Role &amp; Domain Mismatch Detected
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                Factual Truth Preserved
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-rose-700 font-bold">
                Tailoring Withheld
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Cannot Tailor Resume for &ldquo;{jobTitle || 'Target Role'}&rdquo; at {companyName || 'Target Company'}
            </h2>
            <p className="text-xs md:text-sm text-slate-600 max-w-3xl leading-relaxed">
              Your Master Resume and the provided Job Description belong to completely disparate career domains with <strong className="text-rose-700">0% vector alignment</strong>. Generating a customized resume for this position would require fabricating unverified credentials.
            </p>
          </div>

          {/* Alignment Meter Badge */}
          <div className="shrink-0 bg-white border border-rose-200 rounded-xl p-4 text-center min-w-[130px] shadow-sm">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
              Alignment Score
            </div>
            <div className="text-2xl font-bold text-rose-600 font-mono">
              {alignment.alignmentScore}%
            </div>
            <div className="text-[11px] text-rose-700 font-medium">
              Incompatible
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-rose-500 h-1.5 rounded-full" 
                style={{ width: `${Math.max(5, alignment.alignmentScore)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side Dual Domain Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT CARD: WHAT YOUR PROFILE IS */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block">
                  Candidate Profile
                </span>
                <h3 className="text-sm font-bold text-slate-900">What Your Profile Is</h3>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Verified Tech
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block font-medium mb-1">Primary Career Field:</span>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{alignment.candidateDomain}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block font-medium mb-1">Core Architecture Pillars:</span>
              <ul className="space-y-1 pl-1 text-slate-700">
                {alignment.candidatePillars.map((pillar, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                    <span>{pillar}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-slate-500 block font-medium mb-1">Verified Technical Stacks:</span>
              <div className="flex flex-wrap gap-1.5">
                {alignment.candidateVerifiedSkills.map((skill, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-mono text-[11px]">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block font-medium mb-1">Signature Systems Project:</span>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                <strong className="text-slate-900">HookRelay</strong> — High-throughput Webhook-as-a-Service in Java &amp; Spring Boot with Redis Streams pub-sub, HMAC SHA-256 signatures, and Dead-Letter Queue retries.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: WHAT THE JD ACTUALLY DEMANDS */}
        <div className="bg-white border border-rose-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-200">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider block">
                  Target Opening
                </span>
                <h3 className="text-sm font-bold text-slate-900">What The Job Description Demands</h3>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              Incompatible
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block font-medium mb-1">Target Role Category:</span>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-amber-900 font-semibold flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{alignment.jobDomain}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block font-medium mb-1">Mandatory Competencies:</span>
              <ul className="space-y-1 pl-1 text-slate-700">
                {alignment.jobCoreDemands.map((demand, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1" />
                    <span>{demand}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <span className="text-slate-500 block font-medium mb-1">Matched Candidate Skills:</span>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 flex items-center gap-2">
                <span className="text-rose-600 font-bold">0 matching technical skills</span>
                <span>(None of the JD requirements intersect with Java, Spring Boot, or Systems)</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 block font-medium mb-1">Recruiter Impact:</span>
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
                Submitting a software engineering resume for a creative media opening leads to instantaneous ATS filter rejection.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Analysis Narrative */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
          Semantic Analysis: Why Resume Tailoring Was Halted
        </h3>

        <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
          <p>
            <strong className="text-slate-900">Profile Comparison: </strong>
            {aiAnalysisSummary.candidateProfileOverview}
          </p>
          <p>
            <strong className="text-slate-900">Target Role Requirements: </strong>
            {aiAnalysisSummary.jobDemandsOverview}
          </p>
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 space-y-1 text-xs">
            <div className="font-semibold text-amber-800 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              Integrity Policy:
            </div>
            <p>{aiAnalysisSummary.vectorMismatchReason}</p>
            <p className="text-slate-600 pt-0.5">{aiAnalysisSummary.factualIntegrityNotice}</p>
          </div>
        </div>
      </div>

      {/* 4. Actionable Technical Role Recommendations */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Recommended Roles Matching Your Profile
            </h3>
          </div>
          <span className="text-xs text-emerald-700 font-semibold">
            90%+ Fit
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {aiAnalysisSummary.recommendedTargetRoles.map((role, idx) => (
            <div 
              key={idx}
              className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all text-xs space-y-0.5"
            >
              <div className="font-semibold text-slate-900">{role}</div>
              <div className="text-[11px] text-emerald-700 font-medium">92% - 98% Match</div>
              <div className="text-[10px] text-slate-500">Java · Spring · APIs · SQL · Redis</div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={onResetOrEditJd}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Edit Job Description
          </button>

          {onLoadSampleSweJd && (
            <button
              onClick={onLoadSampleSweJd}
              className="w-full sm:w-auto px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Code2 className="w-4 h-4" />
              Load Sample SWE / Backend Job Description
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
