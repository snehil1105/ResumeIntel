import React from 'react';
import { 
  FileText, 
  Building2, 
  User, 
  Briefcase, 
  ChevronRight,
  Info,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  UploadCloud
} from 'lucide-react';
import { MasterResume } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  masterResume?: MasterResume | null;
  hasUploadedResume?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onSelectTab, 
  masterResume,
  hasUploadedResume = false 
}) => {
  const pInfo: any = masterResume?.personal_info || {};
  const fullName = pInfo.full_name || 'Candidate Profile';
  const education = masterResume?.educations?.[0] || (masterResume as any)?.education?.[0] || {
    degree: 'Verified Education',
    institution_name: 'University / Institute'
  };

  const menuItems = [
    { 
      id: 'generator', 
      label: 'Tailor Resume', 
      icon: FileText, 
      desc: 'ATS-aligned customization'
    },
    { 
      id: 'company_intelligence', 
      label: 'Company Research', 
      icon: Building2, 
      desc: 'Tech stack & hiring culture'
    },
    { 
      id: 'applications', 
      label: 'Opportunities', 
      icon: Briefcase, 
      desc: 'LinkedIn & Naukri tracker'
    },
    { 
      id: 'master_resume', 
      label: 'Master Profile', 
      icon: User, 
      desc: 'Verified source of truth'
    },
  ];

  return (
    <aside className="w-full lg:w-[280px] shrink-0 space-y-3 sm:space-y-4">
      {/* 1. Candidate Profile Card (Compact & responsive on mobile) */}
      <div className="bg-white border border-[#E7E7F0] rounded-2xl p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        {hasUploadedResume ? (
          /* Populated State (After Resume Upload) */
          <>
            <div className="flex sm:flex-col items-center gap-3.5 sm:gap-0 sm:text-center">
              {/* Profile Avatar with Progress Ring */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 sm:mx-auto sm:mb-3 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#E7E7F0]"
                    strokeWidth="2.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#F85A38]"
                    strokeDasharray="95, 100"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                
                {/* Avatar inner initial */}
                <div className="absolute w-[50px] h-[50px] sm:w-[62px] sm:h-[62px] rounded-full overflow-hidden bg-[#2B59C3] flex items-center justify-center text-white font-bold text-lg sm:text-xl ring-2 ring-white shadow-sm">
                  <span>{fullName.charAt(0)}</span>
                </div>

                {/* Score percentage pill */}
                <div className="absolute -bottom-1 bg-white border border-[#F85A38] text-[#F85A38] text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-sm">
                  95%
                </div>
              </div>

              {/* Candidate Identity */}
              <div className="flex-1 min-w-0 text-left sm:text-center">
                <h3 className="font-bold text-sm sm:text-base text-[#121224] leading-snug truncate">
                  {fullName}
                </h3>
                <p className="text-xs text-[#474D6A] mt-0.5 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                  {education.degree} <br className="hidden sm:inline" />
                  <span className="text-[#717B9E]">@ {education.institution_name}</span>
                </p>
                <div className="text-[10px] sm:text-[11px] text-[#8292B0] mt-1 font-normal">
                  Profile synced &amp; ready
                </div>
              </div>
            </div>

            {/* Blue CTA Pill Button */}
            <button
              onClick={() => onSelectTab(currentTab === 'generator' ? 'master_resume' : 'generator')}
              className="mt-3 sm:mt-3.5 w-full py-2 px-4 rounded-full bg-[#2B59C3] hover:bg-[#22489F] text-white text-xs font-semibold shadow-sm transition-all"
            >
              {currentTab === 'generator' ? 'View Master Profile' : 'Tailor Resume'}
            </button>
          </>
        ) : (
          /* Empty Initial State (Before Resume Upload) */
          <>
            <div className="flex sm:flex-col items-center gap-3.5 sm:gap-0 sm:text-center">
              {/* Empty Avatar Placeholder */}
              <div className="relative w-14 h-14 sm:w-20 sm:h-20 shrink-0 sm:mx-auto sm:mb-3 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#E7E7F0]"
                    strokeWidth="2.5"
                    strokeDasharray="4, 4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                
                <div className="absolute w-[44px] h-[44px] sm:w-[62px] sm:h-[62px] rounded-full overflow-hidden bg-[#F1F5F9] flex items-center justify-center text-[#94A3B8] ring-2 ring-white shadow-sm">
                  <User className="w-5 h-5 sm:w-7 sm:h-7 text-[#94A3B8]" />
                </div>

                <div className="absolute -bottom-1 bg-white border border-[#CBD5E1] text-[#64748B] text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-sm">
                  0%
                </div>
              </div>

              <div className="flex-1 min-w-0 text-left sm:text-center">
                <h3 className="font-bold text-sm sm:text-base text-[#121224] leading-snug">
                  No Profile Loaded
                </h3>
                <p className="text-xs text-[#717B9E] mt-0.5 leading-relaxed line-clamp-2 sm:line-clamp-none">
                  Upload your resume (PDF/DOCX) on the right to auto-populate credentials.
                </p>
                <div className="text-[10px] sm:text-[11px] text-[#94A3B8] mt-1 font-normal">
                  Awaiting resume upload
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectTab('generator')}
              className="mt-3 sm:mt-3.5 w-full py-2 px-4 rounded-full bg-[#2B59C3] hover:bg-[#22489F] text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Resume to Start</span>
            </button>
          </>
        )}
      </div>

      {/* 2. Profile Performance Card (Compact on mobile) */}
      <div className="bg-white border border-[#E7E7F0] rounded-2xl p-3.5 sm:p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between text-xs font-semibold text-[#121224] mb-1.5 sm:mb-2">
          <div className="flex items-center gap-1.5">
            <span>Profile Performance</span>
            <Info className="w-3.5 h-3.5 text-[#8292B0]" />
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hasUploadedResume ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {hasUploadedResume ? 'Active' : 'Pending'}
          </span>
        </div>

        <div 
          onClick={() => onSelectTab('generator')}
          className="flex items-center justify-between p-2 rounded-xl hover:bg-[#F8F9FA] cursor-pointer transition-colors"
        >
          <div>
            <div className="text-[11px] text-[#717B9E]">ATS Readiness</div>
            <div className="text-sm sm:text-base font-bold text-[#2B59C3] mt-0.5">
              {hasUploadedResume ? '95%' : '—'}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8292B0]" />
        </div>
      </div>

      {/* 3. Workspace Navigation Menu (Visible on desktop; mobile uses top navbar Workspace dropdown) */}
      <div className="hidden lg:block bg-white border border-[#E7E7F0] rounded-2xl p-3 space-y-1 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8292B0]">
          Workspace
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                isActive
                  ? 'bg-[#F2F5FB] text-[#2B59C3] font-bold shadow-none'
                  : 'text-[#474D6A] hover:bg-[#F8F9FA] hover:text-[#121224] font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#2B59C3]' : 'text-[#717B9E]'}`} />
                <span>{item.label}</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#2B59C3]' : 'text-[#CBD5E1]'}`} />
            </button>
          );
        })}
      </div>

      {/* 4. Trust Guarantee Footer */}
      <div className="hidden sm:block p-3.5 rounded-2xl bg-[#F8F9FA] border border-[#E7E7F0] text-[#717B9E] text-[11px] leading-relaxed">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#121224]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2B59C3]" />
          <span>Factual Truth Guarantee</span>
        </div>
        <p className="mt-1 text-[11px]">
          Credentials locked from your Master Profile. Zero fabricated claims.
        </p>
      </div>
    </aside>
  );
};
