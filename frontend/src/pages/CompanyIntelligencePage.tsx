import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Users, 
  Calendar,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  Target,
  GraduationCap,
  Code2
} from 'lucide-react';
import { CompanyResearchReport } from '../types';
import { getOrResearchCompany, synthesizeCompanyReport } from '../utils/companyResearch';

interface CompanyIntelligencePageProps {
  researchReport?: CompanyResearchReport | null;
  companyName?: string;
  jobTitle?: string;
  onSelectCompany?: (company: string) => void;
}

export const CompanyIntelligencePage: React.FC<CompanyIntelligencePageProps> = ({
  researchReport,
  companyName = "Google",
  jobTitle = "Software Engineering Intern - Backend",
  onSelectCompany
}) => {
  const [activeCompany, setActiveCompany] = useState<string>(companyName);
  const [searchQuery, setSearchQuery] = useState<string>(companyName);
  const [report, setReport] = useState<CompanyResearchReport>(() => {
    return researchReport || synthesizeCompanyReport(companyName, jobTitle);
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expandedSourceId, setExpandedSourceId] = useState<string | null>(null);

  useEffect(() => {
    if (companyName && companyName.trim() !== activeCompany && companyName.trim().length >= 2) {
      const timer = setTimeout(() => {
        setActiveCompany(companyName.trim());
        setSearchQuery(companyName.trim());
        loadCompanyReport(companyName.trim(), jobTitle);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [companyName]);

  const loadCompanyReport = async (comp: string, role: string) => {
    setIsLoading(true);
    try {
      const res = await getOrResearchCompany(comp, role);
      if (res) {
        setReport(res);
      } else {
        setReport(synthesizeCompanyReport(comp, role));
      }
    } catch (err) {
      console.warn("Failed to fetch company research, falling back to synthesis", err);
      setReport(synthesizeCompanyReport(comp, role));
    } finally {
      setIsLoading(false);
    }
  };

  const handleIndependentSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) return;
    setActiveCompany(trimmed);
    await loadCompanyReport(trimmed, jobTitle);
  };

  const handleQuickSelect = async (name: string) => {
    setSearchQuery(name);
    setActiveCompany(name);
    await loadCompanyReport(name, jobTitle);
  };

  const handleApplyToHome = () => {
    if (onSelectCompany) {
      onSelectCompany(activeCompany);
    }
  };

  const popularCompanies = [
    'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Stripe', 'Uber'
  ];

  const isKnown = report.is_known_company !== false && !report.business_model.toLowerCase().includes('not a recognized');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-white border border-[#E7E7F0] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-3 py-0.5 rounded-full bg-[#F2F5FB] text-[#2B59C3] border border-[#D3E0FD]">
              Company Research &amp; Hiring Insights
            </span>
            {isKnown ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified Employer
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                Company Not Found
              </span>
            )}
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-[#121224] tracking-tight">
            Company Research: <span className="text-[#2B59C3]">{activeCompany}</span>
          </h2>
          <p className="text-xs text-[#474D6A] max-w-2xl leading-relaxed font-normal">
            Evaluates corporate business models, core engineering culture, technical expectations, selection procedure, and measures candidate fit against your Master Profile.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#F8F9FA] border border-[#E7E7F0] text-xs text-[#474D6A]">
            <Calendar className="w-4 h-4 text-[#8292B0]" />
            <span>Updated: <strong className="text-[#121224] font-semibold">{report.research_date}</strong></span>
          </div>

          {activeCompany.toLowerCase() !== (companyName || '').toLowerCase() && isKnown && (
            <button
              onClick={handleApplyToHome}
              className="px-5 py-2 rounded-full bg-[#2B59C3] hover:bg-[#22489F] text-xs font-semibold text-white transition-all flex items-center gap-1.5 shadow-sm"
              title="Apply this company as your current target job on the Home page"
            >
              <span>Sync to Tailor Tab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-display font-bold text-slate-700 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-periwinkle-500" />
            Search Target Company:
          </span>
          <span className="text-xs text-slate-500">
            Active Target: <strong className="text-slate-800 font-semibold">{activeCompany}</strong> (Home Target: {companyName})
          </span>
        </div>

        {/* Search input form */}
        <form onSubmit={handleIndependentSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search company (e.g. Google, Amazon, Microsoft, Meta, Stripe)..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-periwinkle-500 focus:ring-1 focus:ring-periwinkle-500 font-medium shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 rounded-xl bg-periwinkle-500 hover:bg-periwinkle-600 text-xs font-display font-bold text-white transition-all flex items-center gap-1.5 disabled:opacity-50 shrink-0 shadow-sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                Search
              </>
            )}
          </button>
        </form>

        {/* Quick pill selectors */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
          <span className="text-xs font-display font-semibold text-slate-400 mr-1">Quick Select:</span>
          {popularCompanies.map((c) => {
            const isCurrent = c.toLowerCase() === activeCompany.toLowerCase();
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleQuickSelect(c)}
                className={`px-3 py-1 rounded-lg text-xs font-display font-semibold transition-all ${
                  isCurrent
                    ? 'bg-periwinkle-500 text-white shadow-sm'
                    : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-periwinkle-50 hover:text-periwinkle-700'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* UNKNOWN COMPANY / NOT FOUND VIEW */}
      {!isKnown && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 sm:p-8 space-y-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                Company Not Found
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                No Corporate Records Identified for &ldquo;{activeCompany}&rdquo;
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                We conducted an extensive check across corporate registries, employer directories, and public records, but found no verified organization for &ldquo;{activeCompany}&rdquo;.
              </p>
            </div>
          </div>

          <div className="bg-white border border-rose-200 rounded-lg p-5 space-y-2 text-xs text-slate-700 leading-relaxed shadow-sm">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Resume Tailoring Still Works:</span>
            </div>
            <p className="text-slate-600">
              Even though this company is not in the public database, your resume tailoring is <strong className="text-slate-900">not blocked</strong>. If this is an early-stage startup or unlisted employer, the resume engine will tailor your credentials <strong className="text-blue-600">strictly based on your provided Job Description</strong>.
            </p>
          </div>
        </div>
      )}

      {/* KNOWN COMPANY FULL INTELLIGENCE */}
      {isKnown && (
        <div className="space-y-6">
          {/* SECTION 1: ABOUT THE COMPANY */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Company Profile &amp; Engineering Culture
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business & Products */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Business Model &amp; Core Products</h4>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                  <div>
                    <strong className="text-slate-800 block mb-1">Business Model:</strong>
                    <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700">
                      {report.business_model}
                    </p>
                  </div>

                  <div>
                    <strong className="text-slate-800 block mb-1">Flagship Products &amp; Platforms:</strong>
                    <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700">
                      {report.products_and_services}
                    </p>
                  </div>
                </div>
              </div>

              {/* Culture & Hiring Values */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Engineering Culture &amp; Hiring Values</h4>
                </div>

                <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                  <div>
                    <strong className="text-slate-800 block mb-1">Engineering Culture:</strong>
                    <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700">
                      {report.engineering_culture}
                    </p>
                  </div>

                  <div>
                    <strong className="text-slate-800 block mb-1">Publicly Stated Hiring Principles:</strong>
                    <p className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700">
                      {report.hiring_values}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: TECH REQUIREMENTS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Code2 className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                2. Technical Requirements &amp; Stack Patterns
              </h3>
            </div>

            {report.observed_tech_stack && report.observed_tech_stack.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Most Frequently Observed Technologies</h4>
                  </div>
                  <span className="text-xs text-slate-500">From public engineering postings &amp; tech papers</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {report.observed_tech_stack.map((tech, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{tech.name}</span>
                        <span className="text-blue-600 font-mono font-bold">{tech.frequency_percentage}%</span>
                      </div>
                      
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full" 
                          style={{ width: `${tech.frequency_percentage}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>Category: {tech.category}</span>
                        <span className="font-medium">{tech.is_core_stack ? 'Core Stack' : 'Relevant'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SECTION 3: SELECTION PROCEDURE */}
          {report.selection_procedure && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <GraduationCap className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  3. Selection Procedure &amp; Interview Rounds
                </h3>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-sm">
                <div className="space-y-3">
                  {(Array.isArray(report.selection_procedure) 
                    ? report.selection_procedure 
                    : ((report.selection_procedure as any)?.rounds || [])
                  ).map((round: any, idx: number) => (
                    <div 
                      key={round.round_number || idx} 
                      className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                            {round.round_number || idx + 1}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900">{round.round_name || round.stage_name}</h4>
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">
                          Format: {round.format_type || 'Assessment'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed pl-8">
                        {round.description}
                      </p>

                      <div className="pl-8 pt-1 flex flex-wrap gap-1.5">
                        {(round.key_evaluation_criteria || (round.source ? [round.source] : ['Technical Competence'])).map((crit: string, cIdx: number) => (
                          <span 
                            key={cIdx} 
                            className="text-[11px] px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 font-medium"
                          >
                            ✓ {crit}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: CANDIDATE FIT ANALYSIS */}
          {report.candidate_alignment && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Target className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  4. Candidate Fit &amp; Alignment (Based on Master Profile)
                </h3>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Profile Fit Analysis
                      </h4>
                      <p className="text-xs text-slate-500">
                        Evaluating verified qualifications against {report.company_name}&apos;s verified standards.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <span className="text-xs font-semibold">Match Score:</span>
                    <span className="text-lg font-bold text-emerald-700">{report.candidate_alignment.fit_percentage}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                  {/* Matched Strengths */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Verified Profile Strengths:</span>
                    </div>
                    <ul className="space-y-2 text-slate-700">
                      {report.candidate_alignment.matched_strengths.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Focus */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-amber-800">
                      <GraduationCap className="w-4 h-4 text-amber-600" />
                      <span>Recommended Interview Focus:</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                      {report.candidate_alignment.recommended_focus}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: RESEARCH SOURCES */}
          {report.sources && report.sources.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <ShieldCheck className="w-4 h-4 text-slate-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  5. Verifiable Public Sources &amp; Citations
                </h3>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm">
                {report.sources.map((src) => {
                  const isExpanded = expandedSourceId === src.id;
                  return (
                    <div 
                      key={src.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 overflow-hidden transition-all"
                    >
                      <div 
                        onClick={() => setExpandedSourceId(isExpanded ? null : src.id)}
                        className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {src.source_type.replace('_', ' ')}
                          </span>
                          <h4 className="text-xs font-semibold text-slate-800">{src.title}</h4>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="font-medium text-emerald-700">Confidence: {src.confidence_level}</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 border-t border-slate-200 bg-white space-y-2 text-xs">
                          <div>
                            <strong className="text-slate-700 block mb-0.5">Extracted Finding:</strong>
                            <p className="text-slate-700 leading-relaxed font-mono bg-slate-50 p-2.5 rounded border border-slate-200">
                              {src.extracted_finding}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-500">
                            <span>Retrieved: {src.retrieval_date}</span>
                            <a 
                              href={src.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Inspect Source <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
