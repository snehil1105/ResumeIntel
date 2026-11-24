import React, { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, 
  Calendar, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink,
  Clock,
  Search,
  RefreshCw,
  Compass,
  Check,
  MapPin,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Award,
  GraduationCap
} from 'lucide-react';
import { JobApplication, DiscoveredJob, MasterResume } from '../types';
import { extractSkillsFromResume, fetchDiscoveredJobs, generatePlatformSearchUrl } from '../utils/jobDiscovery';

interface ApplicationsPageProps {
  applications: JobApplication[];
  onUpdateStatus: (id: string, status: string) => void;
  onNavigate: (tab: string) => void;
  masterResume?: MasterResume | null;
  onTailorForJob?: (company: string, role: string, jdText: string) => void;
  onAddApplication?: (app: JobApplication) => void;
}

export const ApplicationsPage: React.FC<ApplicationsPageProps> = ({
  applications,
  onUpdateStatus,
  onNavigate,
  masterResume,
  onTailorForJob,
  onAddApplication
}) => {
  // Top-level Navigation Mode: Discovery vs. Application Tracker Pipeline
  const [activeView, setActiveView] = useState<'DISCOVERY' | 'PIPELINE'>('DISCOVERY');

  // Discovery Filters & States
  const [syncedSkills, setSyncedSkills] = useState<string[]>(() => extractSkillsFromResume(masterResume));
  const [activeSkillFilters, setActiveSkillFilters] = useState<string[]>([]);
  const [platformPriority, setPlatformPriority] = useState<'LINKEDIN' | 'NAUKRI' | 'MATCH'>('LINKEDIN');
  const [platformFilter, setPlatformFilter] = useState<'ALL' | 'LINKEDIN' | 'NAUKRI'>('ALL');
  const [jobTypeFilter, setJobTypeFilter] = useState<'ALL' | 'JOB' | 'INTERNSHIP'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('India');
  const [expandedJdId, setExpandedJdId] = useState<string | null>(null);
  const [trackedJobIds, setTrackedJobIds] = useState<Set<string>>(new Set());

  // Loading & Data State for Discovery
  const [isLoadingJobs, setIsLoadingJobs] = useState<boolean>(false);
  const [discoveredJobs, setDiscoveredJobs] = useState<DiscoveredJob[]>([]);

  // Pipeline State
  const [apps, setApps] = useState<JobApplication[]>(applications);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Sync with master resume when it updates
  useEffect(() => {
    const skills = extractSkillsFromResume(masterResume);
    setSyncedSkills(skills);
  }, [masterResume]);

  // Keep local apps in sync with prop updates
  useEffect(() => {
    setApps(applications);
  }, [applications]);

  // Fetch jobs whenever search filters change
  const loadJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const skillsToSearch = activeSkillFilters.length > 0 ? activeSkillFilters : syncedSkills;
      const results = await fetchDiscoveredJobs({
        skills: skillsToSearch,
        platform: platformFilter,
        jobType: jobTypeFilter,
        roleQuery: searchQuery,
        location: selectedLocation
      });
      setDiscoveredJobs(results);
    } catch (e) {
      console.error('Error fetching jobs:', e);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [platformFilter, jobTypeFilter, selectedLocation]);

  // Manual Trigger for search input
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadJobs();
  };

  // Toggle a skill in active filter
  const toggleSkillFilter = (skill: string) => {
    setActiveSkillFilters(prev => {
      const exists = prev.includes(skill);
      return exists ? prev.filter(s => s !== skill) : [...prev, skill];
    });
  };

  // Sort discovered jobs based on platform priority
  const sortedDiscoveredJobs = useMemo(() => {
    const list = [...discoveredJobs];
    if (platformPriority === 'LINKEDIN') {
      return list.sort((a, b) => {
        if (a.platform === 'LINKEDIN' && b.platform !== 'LINKEDIN') return -1;
        if (b.platform === 'LINKEDIN' && a.platform !== 'LINKEDIN') return 1;
        return b.matchPercentage - a.matchPercentage;
      });
    } else if (platformPriority === 'NAUKRI') {
      return list.sort((a, b) => {
        if (a.platform === 'NAUKRI' && b.platform !== 'NAUKRI') return -1;
        if (b.platform === 'NAUKRI' && a.platform !== 'NAUKRI') return 1;
        return b.matchPercentage - a.matchPercentage;
      });
    } else {
      return list.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }
  }, [discoveredJobs, platformPriority]);

  // Handle saving discovered job to pipeline
  const handleTrackJob = (job: DiscoveredJob) => {
    const newApp: JobApplication = {
      id: `app-${Date.now()}-${job.id}`,
      companyName: job.company,
      jobTitle: job.title,
      status: 'INTERESTED',
      applicationDate: new Date().toISOString().split('T')[0],
      portalUrl: job.jobUrl,
      notes: `Discovered on ${job.platform}. Match: ${job.matchPercentage}%. ${job.salaryOrStipend ? 'Comp: ' + job.salaryOrStipend : ''}`
    };

    if (onAddApplication) {
      onAddApplication(newApp);
    } else {
      setApps(prev => [newApp, ...prev]);
    }

    setTrackedJobIds(prev => new Set(prev).add(job.id));
  };

  const statuses = [
    'INTERESTED',
    'RESEARCHING',
    'RESUME_READY',
    'APPLIED',
    'ASSESSMENT',
    'INTERVIEW',
    'OFFER',
    'REJECTED'
  ];

  const handleStatusChange = (id: string, newStatus: string) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status: newStatus as any } : a));
    onUpdateStatus(id, newStatus);
  };

  const filteredApps = filterStatus === 'ALL'
    ? apps
    : apps.filter(a => a.status === filterStatus);

  const interviewCount = apps.filter(a => a.status === 'INTERVIEW' || a.status === 'OFFER').length;
  const conversionRate = apps.length > 0 ? ((interviewCount / apps.length) * 100).toFixed(0) : '0';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white border border-[#E7E7F0] rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2B59C3] flex items-center justify-center text-white shadow-sm">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#121224] tracking-tight">
                  Job Intelligence &amp; Tracker
                </h2>
                <p className="text-xs text-[#474D6A] mt-0.5 font-normal">
                  Discover verified software roles &amp; internships across LinkedIn &amp; Naukri matching your profile.
                </p>
              </div>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 bg-[#F8F9FA] p-1 rounded-full border border-[#E7E7F0] self-stretch md:self-auto">
            <button
              onClick={() => setActiveView('DISCOVERY')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeView === 'DISCOVERY'
                  ? 'bg-[#2B59C3] text-white shadow-sm'
                  : 'text-[#474D6A] hover:text-[#121224]'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Explore Opportunities
            </button>

            <button
              onClick={() => setActiveView('PIPELINE')}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeView === 'PIPELINE'
                  ? 'bg-[#2B59C3] text-white shadow-sm'
                  : 'text-[#474D6A] hover:text-[#121224]'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Tracked Pipeline ({apps.length})
            </button>
          </div>
        </div>

        {/* Real-Time Skill Synchronization Banner */}
        {activeView === 'DISCOVERY' && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">
                  Synced Profile Skills ({syncedSkills.length}):
                </span>
                <span className="text-[11px] text-slate-500 hidden sm:inline">
                  (Matched dynamically against live hiring requirements)
                </span>
              </div>

              <button
                onClick={() => {
                  const skills = extractSkillsFromResume(masterResume);
                  setSyncedSkills(skills);
                  setActiveSkillFilters([]);
                  loadJobs();
                }}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 self-start lg:self-auto transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Re-sync from Profile
              </button>
            </div>

            {/* Candidate Skill Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5 max-h-24 overflow-y-auto pr-1">
              {syncedSkills.map(skill => {
                const isSelected = activeSkillFilters.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkillFilter(skill)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span>{skill}</span>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </button>
                );
              })}
            </div>
            {activeSkillFilters.length > 0 && (
              <div className="mt-2 text-xs text-amber-700 flex items-center justify-between bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                <span>Filtering strictly by: {activeSkillFilters.join(', ')}</span>
                <button
                  onClick={() => {
                    setActiveSkillFilters([]);
                    loadJobs();
                  }}
                  className="font-semibold underline hover:text-amber-800"
                >
                  Clear filter
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: LIVE JOB & INTERNSHIP DISCOVERY (LINKEDIN & NAUKRI)             */}
      {/* ========================================================================= */}
      {activeView === 'DISCOVERY' && (
        <div className="space-y-6">
          {/* Controls Bar: Priority Switch + Search & Filters */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Option to choose which jobs to see first */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Platform Priority (Which Jobs to See First):
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {/* LinkedIn First Button */}
                  <button
                    onClick={() => setPlatformPriority('LINKEDIN')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all border ${
                      platformPriority === 'LINKEDIN'
                        ? 'bg-[#0a66c2] text-white border-[#0a66c2] shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-4 h-4 rounded bg-white text-[#0a66c2] flex items-center justify-center font-bold text-[10px] leading-none">
                      in
                    </span>
                    LinkedIn Jobs First
                  </button>

                  {/* Naukri First Button */}
                  <button
                    onClick={() => setPlatformPriority('NAUKRI')}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all border ${
                      platformPriority === 'NAUKRI'
                        ? 'bg-[#1855a3] text-white border-[#1855a3] shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-4 h-4 rounded bg-[#ff7555] text-white flex items-center justify-center font-extrabold text-[10px] leading-none">
                      N
                    </span>
                    Naukri Jobs First
                  </button>

                  {/* Match % First */}
                  <button
                    onClick={() => setPlatformPriority('MATCH')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border ${
                      platformPriority === 'MATCH'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    Top Skill Match First
                  </button>
                </div>
              </div>

              {/* Opportunity Type: Internships vs Jobs */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Opportunity Type:
                </label>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setJobTypeFilter('ALL')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      jobTypeFilter === 'ALL'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => setJobTypeFilter('INTERNSHIP')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                      jobTypeFilter === 'INTERNSHIP'
                        ? 'bg-white text-amber-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-amber-600" />
                    Internships Only
                  </button>
                  <button
                    onClick={() => setJobTypeFilter('JOB')}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                      jobTypeFilter === 'JOB'
                        ? 'bg-white text-emerald-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                    Full-Time Jobs
                  </button>
                </div>
              </div>
            </div>

            {/* Search Input & Platform Selector */}
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
              <div className="md:col-span-6 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by role or company (e.g. Google, SDE Intern, Backend, React)..."
                  className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div className="md:col-span-3">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-medium shadow-sm"
                >
                  <option value="India">All India (Pan-India)</option>
                  <option value="Bengaluru">Bengaluru / Bangalore</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                  <option value="Gurgaon">Gurgaon / Delhi NCR</option>
                  <option value="Remote">Remote Only</option>
                </select>
              </div>

              <div className="md:col-span-3 flex items-center gap-2">
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-medium shadow-sm"
                >
                  <option value="ALL">All Platforms (Both)</option>
                  <option value="LINKEDIN">LinkedIn Jobs Only</option>
                  <option value="NAUKRI">Naukri.com Only</option>
                </select>

                <button
                  type="submit"
                  disabled={isLoadingJobs}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5 shadow-sm"
                >
                  {isLoadingJobs ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Quick-Launch Live Search Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href={generatePlatformSearchUrl('LINKEDIN', searchQuery || 'Software Engineer Intern', selectedLocation, jobTypeFilter === 'INTERNSHIP')}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-4 flex items-center justify-between group transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0a66c2] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  in
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    Search Live on LinkedIn Jobs
                    <ExternalLink className="w-3 h-3 text-[#0a66c2]" />
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Live query for {searchQuery || 'Software Engineering'} in {selectedLocation}
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </a>

            <a
              href={generatePlatformSearchUrl('NAUKRI', searchQuery || 'Software Engineer Intern', selectedLocation, jobTypeFilter === 'INTERNSHIP')}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-xl p-4 flex items-center justify-between group transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1855a3] text-[#ff7555] flex items-center justify-center font-extrabold text-sm shadow-sm">
                  N
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#1855a3] transition-colors flex items-center gap-1.5">
                    Search Live on Naukri.com
                    <ExternalLink className="w-3 h-3 text-[#ff7555]" />
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Verified Fresher &amp; Internship vacancies on Naukri portal
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#1855a3] group-hover:translate-x-1 transition-all" />
            </a>
          </div>

          {/* Results Header Count */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="font-medium text-slate-700">
              Showing {sortedDiscoveredJobs.length} opportunities matching your verified skills
            </span>
            <span>
              Priority: <strong className="text-slate-800">{platformPriority === 'LINKEDIN' ? 'LinkedIn First' : platformPriority === 'NAUKRI' ? 'Naukri First' : 'Skill Match Score'}</strong>
            </span>
          </div>

          {/* Discovered Job Cards List */}
          {isLoadingJobs ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 shadow-sm">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-800">Aggregating live opportunities from LinkedIn &amp; Naukri...</p>
              <p className="text-xs text-slate-500">Matching real-time requirements against your Master Profile.</p>
            </div>
          ) : sortedDiscoveredJobs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 shadow-sm">
              <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">No matching jobs found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try widening your search keywords, switching the location to &quot;All India&quot;, or selecting &quot;All Platforms&quot;.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sortedDiscoveredJobs.map(job => {
                const isTracked = trackedJobIds.has(job.id);
                const isExpanded = expandedJdId === job.id;

                return (
                  <div
                    key={job.id}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 transition-all shadow-sm hover:shadow-md space-y-4"
                  >
                    {/* Card Top: Platform Badge, Opportunity Type, and Match Score */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        {/* Platform Badge */}
                        {job.platform === 'LINKEDIN' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#0a66c2]/10 border border-[#0a66c2]/30 text-[#0a66c2]">
                            <span className="w-3.5 h-3.5 rounded-sm bg-[#0a66c2] text-white flex items-center justify-center font-bold text-[9px] leading-none">
                              in
                            </span>
                            LinkedIn Jobs
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#1855a3]/10 border border-[#1855a3]/30 text-[#1855a3]">
                            <span className="w-3.5 h-3.5 rounded-sm bg-[#ff7555] text-white flex items-center justify-center font-extrabold text-[9px] leading-none">
                              N
                            </span>
                            Naukri.com
                          </span>
                        )}

                        {/* Job vs Internship Badge */}
                        {job.jobType === 'INTERNSHIP' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-amber-50 border border-amber-200 text-amber-800">
                            <GraduationCap className="w-3 h-3 text-amber-600" />
                            Internship
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50 border border-emerald-200 text-emerald-800">
                            <Briefcase className="w-3 h-3 text-emerald-600" />
                            Full-Time
                          </span>
                        )}

                        {job.badgeTag && (
                          <span className="text-[11px] text-slate-500 hidden sm:inline">
                            • {job.badgeTag}
                          </span>
                        )}
                      </div>

                      {/* Match Score Badge */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">Skill Match:</span>
                        <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {job.matchPercentage}%
                        </div>
                      </div>
                    </div>

                    {/* Card Body: Title, Company, Meta */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                          <span className="font-semibold text-blue-600 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-blue-600" />
                            {job.company}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-500">
                            <MapPin className="w-3.5 h-3.5" />
                            {job.location}
                          </span>
                          {job.salaryOrStipend && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-emerald-700">
                                {job.salaryOrStipend}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span className="text-slate-400">
                            {job.postedDate}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shrink-0 self-start">
                        Level: <strong className="text-slate-800">{job.experienceLevel}</strong>
                      </div>
                    </div>

                    {/* Description Snippet */}
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {job.descriptionSnippet}
                    </p>

                    {/* Matched vs Missing Skills Badges */}
                    <div className="space-y-1.5 pt-0.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 mr-1">
                          Matched:
                        </span>
                        {job.matchedSkills.map(sk => (
                          <span
                            key={sk}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 border border-emerald-200 text-emerald-800"
                          >
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                            {sk}
                          </span>
                        ))}

                        {job.missingSkills && job.missingSkills.length > 0 && (
                          <>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-2 mr-1">
                              Desired:
                            </span>
                            {job.missingSkills.map(sk => (
                              <span
                                key={sk}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
                              >
                                {sk}
                              </span>
                            ))}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Expandable Full JD */}
                    {isExpanded && (
                      <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 whitespace-pre-line leading-relaxed font-mono">
                        {job.fullJd}
                      </div>
                    )}

                    {/* Card Actions Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setExpandedJdId(isExpanded ? null : job.id)}
                        className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-3.5 h-3.5" />
                            Hide Qualifications
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-3.5 h-3.5" />
                            View Full Job Description &amp; Qualifications
                          </>
                        )}
                      </button>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* 1-Click Tailor Resume button */}
                        <button
                          onClick={() => {
                            if (onTailorForJob) {
                              onTailorForJob(job.company, job.title, job.fullJd);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-all shadow-sm"
                        >
                          Tailor Resume for this Role
                        </button>

                        {/* Track in Pipeline */}
                        <button
                          onClick={() => handleTrackJob(job)}
                          disabled={isTracked}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                            isTracked
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                          }`}
                        >
                          {isTracked ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              Tracked
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                              Track Role
                            </>
                          )}
                        </button>

                        {/* Primary Platform Job Link (Exact role page without redirect) */}
                        <a
                          href={job.platform === 'LINKEDIN' ? (job.linkedinUrl || job.jobUrl) : (job.naukriUrl || job.jobUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border shadow-sm ${
                            job.platform === 'LINKEDIN'
                              ? 'bg-[#0a66c2] text-white border-[#0a66c2] hover:bg-[#084e96]'
                              : 'bg-[#1855a3] text-white border-[#1855a3] hover:bg-[#124280]'
                          }`}
                        >
                          <span>Open on {job.platform === 'LINKEDIN' ? 'LinkedIn' : 'Naukri'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        {/* Alternative Platform Link */}
                        {job.platform === 'LINKEDIN' && job.naukriUrl && (
                          <a
                            href={job.naukriUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                            title="Search this exact role on Naukri.com"
                          >
                            <span className="w-3.5 h-3.5 rounded-sm bg-[#ff7555] text-white flex items-center justify-center font-extrabold text-[9px] leading-none">N</span>
                            <span className="hidden sm:inline">Naukri</span>
                          </a>
                        )}
                        {job.platform === 'NAUKRI' && job.linkedinUrl && (
                          <a
                            href={job.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                            title="Search this exact role on LinkedIn"
                          >
                            <span className="w-3.5 h-3.5 rounded-sm bg-[#0a66c2] text-white flex items-center justify-center font-bold text-[9px] leading-none">in</span>
                            <span className="hidden sm:inline">LinkedIn</span>
                          </a>
                        )}

                        {/* Official Career Portal Link if available */}
                        {job.careerPortalUrl && (
                          <a
                            href={job.careerPortalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                            title="Visit company official career portal"
                          >
                            <Building2 className="w-3 h-3" />
                            <span className="hidden md:inline">Careers</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: TRACKED APPLICATION PIPELINE                                    */}
      {/* ========================================================================= */}
      {activeView === 'PIPELINE' && (
        <div className="space-y-6">
          {/* Analytics Metric Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Total Tracked Roles</span>
              <div className="text-2xl font-bold text-slate-900">{apps.length}</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Resumes Customized</span>
              <div className="text-2xl font-bold text-blue-600">
                {apps.filter(a => a.status !== 'INTERESTED').length}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Interviews &amp; Offers</span>
              <div className="text-2xl font-bold text-amber-600">{interviewCount}</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Interview Conversion</span>
              <div className="text-2xl font-bold text-emerald-600">{conversionRate}%</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
              }`}
            >
              All ({apps.length})
            </button>
            {statuses.map(st => {
              const count = apps.filter(a => a.status === st).length;
              return (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterStatus === st
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
                  }`}
                >
                  {st.replace('_', ' ')} ({count})
                </button>
              );
            })}
          </div>

          {/* Applications List */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {filteredApps.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No tracked applications in this status. Discover roles in the LinkedIn &amp; Naukri tab and click &quot;Track Role&quot;!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredApps.map(app => (
                  <div key={app.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-base shrink-0 mt-0.5">
                        {app.companyName.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{app.jobTitle}</h3>
                          <span className="text-xs font-semibold text-blue-600">@ {app.companyName}</span>
                        </div>
                        {app.notes && (
                          <p className="text-xs text-slate-600 leading-relaxed max-w-xl">{app.notes}</p>
                        )}
                        <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            Applied: {app.applicationDate || 'Not specified'}
                          </span>
                          {app.followUpDate && (
                            <span className="flex items-center gap-1 text-amber-700">
                              <Clock className="w-3 h-3" />
                              Follow-up: {app.followUpDate}
                            </span>
                          )}
                          {app.portalUrl && (
                            <a
                              href={app.portalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Listing Link
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status Selector & Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="bg-white border border-slate-200 text-xs text-slate-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 font-medium shadow-sm"
                      >
                        {statuses.map(st => (
                          <option key={st} value={st}>
                            {st.replace('_', ' ')}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => {
                          if (onTailorForJob) {
                            onTailorForJob(app.companyName, app.jobTitle, app.notes || '');
                          } else {
                            onNavigate('generator');
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors shadow-sm"
                      >
                        Tailor Resume
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
