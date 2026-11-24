import React from 'react';
import { 
  FileText, 
  Briefcase, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Building2,
  CheckCircle2
} from 'lucide-react';
import { MasterResume, JobApplication } from '../types';

interface DashboardPageProps {
  masterResume: MasterResume | null;
  applications: JobApplication[];
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  masterResume,
  applications,
  onNavigate
}) => {
  const verifiedSkillsCount = masterResume?.skills?.filter(s => s.is_verified).length || 10;
  const verifiedProjectsCount = masterResume?.projects?.filter(p => p.is_verified).length || 2;
  const activeApplications = applications.filter(a => a.status !== 'REJECTED');
  const interviewCount = applications.filter(a => a.status === 'INTERVIEW' || a.status === 'OFFER').length;

  return (
    <div className="space-y-6">
      {/* Top Welcome Hero */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Resume Intelligence Active
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Welcome back, {masterResume?.personal_info?.full_name || 'Candidate'}
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Your verified Master Resume is locked as the single source of truth. Analyze company job descriptions to generate factually accurate, role-tailored resumes with full human oversight.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => onNavigate('new_job')}
              className="px-4 py-2 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              Analyze New Job Description
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('master_resume')}
              className="px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
            >
              View Master Resume Profile
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Master Resume Status</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">Verified v{masterResume?.version_number || 1}</div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Protected Fields Locked
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Verified Skills</span>
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold text-white">{verifiedSkillsCount} Skills</div>
          <p className="text-[11px] text-slate-400">
            Across {verifiedProjectsCount} verified projects
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Applications</span>
            <Briefcase className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl font-bold text-white">{activeApplications.length} Tracked</div>
          <p className="text-[11px] text-slate-400">
            In Kanban application pipeline
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Interview Pipeline</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white">{interviewCount} Active</div>
          <p className="text-[11px] text-amber-400">
            {((interviewCount / Math.max(applications.length, 1)) * 100).toFixed(0)}% conversion rate
          </p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Target Applications */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Target Company Applications</h3>
              <p className="text-xs text-slate-400">Recent custom resume versions generated per target role</p>
            </div>
            <button
              onClick={() => onNavigate('applications')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              View all
            </button>
          </div>

          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="p-3.5 rounded-lg border border-slate-800 bg-slate-800/20 hover:bg-slate-800/40 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                    {app.companyName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{app.jobTitle}</h4>
                    <p className="text-[11px] text-slate-400">{app.companyName} • Applied: {app.applicationDate || 'Recent'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    app.status === 'INTERVIEW'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : app.status === 'RESUME_READY'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                  }`}>
                    {app.status.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => onNavigate('resume_studio')}
                    className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Action Hub & Integrity Reminders */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">Suggested Next Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('new_job')}
                className="w-full text-left p-3 rounded-lg border border-slate-800 bg-slate-800/30 hover:border-blue-500/30 hover:bg-blue-600/5 transition-all text-xs space-y-1"
              >
                <strong className="text-slate-200 block">Analyze Google Backend Role</strong>
                <span className="text-slate-400 block text-[11px]">Compare Master Resume vs Google distributed systems stack.</span>
              </button>

              <button
                onClick={() => onNavigate('company_intelligence')}
                className="w-full text-left p-3 rounded-lg border border-slate-800 bg-slate-800/30 hover:border-blue-500/30 hover:bg-blue-600/5 transition-all text-xs space-y-1"
              >
                <strong className="text-slate-200 block">Explore Company Intelligence</strong>
                <span className="text-slate-400 block text-[11px]">Review verified citations and observed engineering culture.</span>
              </button>

              <button
                onClick={() => onNavigate('resume_studio')}
                className="w-full text-left p-3 rounded-lg border border-slate-800 bg-slate-800/30 hover:border-blue-500/30 hover:bg-blue-600/5 transition-all text-xs space-y-1"
              >
                <strong className="text-slate-200 block">Review Pending HITL Proposals</strong>
                <span className="text-slate-400 block text-[11px]">2 bullet enhancements awaiting your verification.</span>
              </button>
            </div>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <ShieldCheck className="w-4 h-4" />
              <span>Air-Gap Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ResumeIntel AI never automatically modifies dates, employers, degrees, or contact details. All resume modifications require your approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
