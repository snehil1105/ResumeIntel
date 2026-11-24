import React, { useState } from 'react';
import { 
  Sliders, 
  FileDown, 
  CheckCircle, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle, 
  HelpCircle,
  BarChart,
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  MasterResume, 
  ChangeProposal, 
  CandidateMatchReport, 
  SkillGapReport, 
  ATSReport 
} from '../types';
import { ProposalApprovalCard } from '../components/ProposalApprovalCard';
import { SideBySideDiff } from '../components/SideBySideDiff';

interface ResumeStudioPageProps {
  masterResume: MasterResume;
  companyName?: string;
  jobTitle?: string;
}

export const ResumeStudioPage: React.FC<ResumeStudioPageProps> = ({
  masterResume,
  companyName = "Google",
  jobTitle = "Software Engineering Intern - Backend"
}) => {
  const [activeTab, setActiveTab] = useState<'approvals' | 'comparison' | 'gaps' | 'ats'>('approvals');

  // Sample Matching Report
  const matchReport: CandidateMatchReport = {
    id: "match-1",
    overall_match_score: 82.5,
    technical_skill_score: 85.0,
    project_relevance_score: 88.0,
    experience_relevance_score: 75.0,
    education_score: 90.0,
    domain_score: 78.0,
    matched_skills: ["Java", "Spring Boot", "SQL", "Git", "REST APIs"],
    missing_mandatory_skills: [],
    missing_preferred_skills: ["Docker", "Kafka", "Microservices"],
    relevant_projects: [
      {
        project_id: "proj-1",
        project_title: "Distributed E-Commerce Platform",
        relevance_score: 92.0,
        matched_technologies: ["Java", "Spring Boot", "PostgreSQL", "Docker"],
        relevance_explanation: "Directly demonstrates building backend services and relational database transactions in Java."
      }
    ],
    improvement_recommendations: [
      "Clarify architectural patterns used in the primary backend project",
      "Highlight API response time improvements and database indexing"
    ]
  };

  // Sample Skill Gap Items (Categories A-E)
  const [gaps, setGaps] = useState<SkillGapReport>({
    id: "gap-1",
    total_gaps_count: 2,
    category_counts: { "A": 0, "B": 1, "C": 1, "D": 0, "E": 0 },
    gaps: [
      {
        id: "gap-docker",
        skill_name: "Docker",
        importance: "PREFERRED",
        gap_category: "B", // Possessed but under-demonstrated
        explanation: "Docker is emphasized in target requirements. Your projects mention full-stack development, but containerization architecture is not explicitly detailed in project bullets.",
        verification_question: "Did you use Docker Compose to spin up multi-container services in your E-Commerce project?",
        is_confirmed_by_user: true,
        user_response: "Yes, I containerized the Spring Boot API and PostgreSQL datastore using Docker Compose."
      },
      {
        id: "gap-kafka",
        skill_name: "Apache Kafka",
        importance: "PREFERRED",
        gap_category: "C", // Partially familiar
        explanation: "Distributed streaming (Kafka) is preferred. No message brokers are currently documented in your master resume.",
        verification_question: "Have you worked with Apache Kafka or RabbitMQ in academic projects?",
        is_confirmed_by_user: false
      }
    ],
    pending_questions: []
  });

  // Proposals
  const [proposals, setProposals] = useState<ChangeProposal[]>([
    {
      id: "prop-1",
      section_type: "PROFESSIONAL_SUMMARY",
      target_id: "summary",
      original_content: "Motivated computer science student with hands-on experience in Java, Spring Boot, distributed backend architectures, and AI integration. Proven track record building resilient REST APIs and full-stack applications.",
      proposed_content: `Aspiring Software Engineer with proven hands-on experience in Java and Spring Boot. Skilled in architecting high-performance RESTful APIs, optimizing relational PostgreSQL transactions, and containerizing distributed microservices. Eager to contribute to Google's engineering culture as a Software Engineering Intern.`,
      justification_why: "Directly tailors the professional summary to address Google's backend criteria, highlighting verified Java and API experience while aligning with the target role.",
      supporting_jd_requirement: "Experience with general-purpose programming languages including Java, RESTful APIs, and database engineering.",
      supporting_company_insight: "Google engineering documentation emphasizes code readability, maintainability, and clean modular abstractions.",
      expected_benefit: "Instantly establishes relevance in recruiter screen without altering verified credentials.",
      confidence_level: 0.96,
      evidence_status: "VERIFIED_FROM_MASTER",
      approval_status: "APPROVED"
    },
    {
      id: "prop-2",
      section_type: "PROJECT_BULLET",
      target_id: "proj-1-bullet-0",
      original_content: "Architected modular microservices using Spring Boot and Hibernate with PostgreSQL datastores.",
      proposed_content: "Engineered scalable RESTful web services in Spring Boot and PostgreSQL, designing clean layered domain entities and reducing average query latency by 28%.",
      justification_why: "Elevates technical clarity and highlights concrete query optimization metrics already verified in Master Resume.",
      supporting_jd_requirement: "Develop, test, and maintain robust backend services and relational datastores.",
      supporting_company_insight: "Engineering blog reveals strong preference for latency-conscious database query design.",
      expected_benefit: "Demonstrates metric-driven STAR impact and architectural depth.",
      confidence_level: 0.94,
      evidence_status: "VERIFIED_FROM_MASTER",
      approval_status: "PENDING",
      verification_question: "Did you benchmark query latency improvements using pg_stat_statements or logging metrics?"
    }
  ]);

  // Sample ATS Report
  const atsReport: ATSReport = {
    overall_ats_score: 92,
    keyword_relevance_score: 95,
    readability_score: 94,
    section_structure_score: 100,
    bullet_quality_score: 88,
    formatting_score: 96,
    findings: [
      { category: "STRUCTURE", severity: "INFO", message: "Single-column hierarchy conforms with major enterprise ATS parsing specifications." },
      { category: "KEYWORDS", severity: "INFO", message: "Strong density for Java, Spring Boot, REST APIs, and PostgreSQL." }
    ],
    repetition_warnings: [],
    missing_critical_keywords: ["gRPC"],
    parsing_compatibility_status: "PASS",
    disclaimer: "This score is an internal heuristic indicator for structural clarity, keyword relevance, and document parsing compatibility. It is not an actual ATS algorithm score and does not guarantee employment."
  };

  // Human-in-the-Loop Handlers
  const handleApprove = (id: string) => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, approval_status: 'APPROVED' } : p));
  };

  const handleReject = (id: string) => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, approval_status: 'REJECTED' } : p));
  };

  const handleEdit = (id: string, text: string) => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, user_edited_content: text, approval_status: 'EDITED' } : p));
  };

  const handleSaveForLater = (id: string) => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, approval_status: 'SAVED_FOR_LATER' } : p));
  };

  // Build Customized Resume by applying approved proposals to a clone of Master Resume
  const customizedResume: MasterResume = JSON.parse(JSON.stringify(masterResume));
  proposals.forEach(p => {
    if (p.approval_status === 'APPROVED' || p.approval_status === 'EDITED') {
      const content = p.user_edited_content || p.proposed_content;
      if (p.section_type === 'PROFESSIONAL_SUMMARY') {
        customizedResume.professional_summary = content;
      } else if (p.section_type === 'PROJECT_BULLET') {
        if (customizedResume.projects[0] && customizedResume.projects[0].bullet_points[0]) {
          customizedResume.projects[0].bullet_points[0] = content;
        }
      }
    }
  });

  const handleExportPDF = () => {
    alert(`Generating ATS-compliant single-column PDF for ${companyName} (${jobTitle})... File ready for download.`);
  };

  const handleExportDOCX = () => {
    alert(`Generating ATS-compliant DOCX document for ${companyName} (${jobTitle})... File ready for download.`);
  };

  const pendingCount = proposals.filter(p => p.approval_status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Resume Studio &amp; Approval Center</h2>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              {companyName} • {jobTitle}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Human-in-the-Loop Gateway. Every proposed modification requires your explicit approval before inclusion into the customized resume.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportDOCX}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-700 bg-slate-800 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <FileDown className="w-4 h-4 text-blue-400" />
            Export DOCX
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500 transition-colors shadow-sm shadow-blue-500/20"
          >
            <FileDown className="w-4 h-4" />
            Export ATS PDF
          </button>
        </div>
      </div>

      {/* Matching Score Summary Strip */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="border-r border-slate-800 pr-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Overall Match</span>
          <div className="text-2xl font-bold text-blue-400">{matchReport.overall_match_score}%</div>
          <span className="text-[10px] text-emerald-400">High Alignment</span>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-slate-400">Technical Skills</span>
          <div className="text-lg font-bold text-white">{matchReport.technical_skill_score}%</div>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-slate-400">Project Relevance</span>
          <div className="text-lg font-bold text-white">{matchReport.project_relevance_score}%</div>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-slate-400">Experience Alignment</span>
          <div className="text-lg font-bold text-white">{matchReport.experience_relevance_score}%</div>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-slate-400">Education Match</span>
          <div className="text-lg font-bold text-white">{matchReport.education_score}%</div>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-slate-400">ATS Heuristic</span>
          <div className="text-lg font-bold text-emerald-400">{atsReport.overall_ats_score}/100</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'approvals'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Proposed Recommendations</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {pendingCount} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'comparison'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Side-by-Side Resume Diff</span>
        </button>

        <button
          onClick={() => setActiveTab('gaps')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'gaps'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Skill Gap &amp; Verification</span>
        </button>

        <button
          onClick={() => setActiveTab('ats')}
          className={`px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'ats'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>ATS Evaluation Report</span>
        </button>
      </div>

      {/* Tab 1: Human-in-the-Loop Approvals */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Reviewing proposed modifications. Every change must have an explanation and source.</span>
            <span>{proposals.length} total proposals</span>
          </div>

          <div className="space-y-4">
            {proposals.map(proposal => (
              <ProposalApprovalCard
                key={proposal.id}
                proposal={proposal}
                onApprove={handleApprove}
                onReject={handleReject}
                onEdit={handleEdit}
                onSaveForLater={handleSaveForLater}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Side-by-Side Diff */}
      {activeTab === 'comparison' && (
        <SideBySideDiff
          masterResume={masterResume}
          customizedResume={customizedResume}
          proposals={proposals}
          companyName={companyName}
          jobTitle={jobTitle}
          onExportPDF={handleExportPDF}
          onExportDOCX={handleExportDOCX}
        />
      )}

      {/* Tab 3: Skill Gaps */}
      {activeTab === 'gaps' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Honest Skill Gap Analysis (Categories A–E)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Missing qualifications are never falsely added. Unverified tools trigger direct questions to the candidate.
            </p>
          </div>

          <div className="space-y-3">
            {gaps.gaps.map((gap) => (
              <div key={gap.id} className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{gap.skill_name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Category {gap.gap_category}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">{gap.importance}</span>
                </div>

                <p className="text-slate-300">{gap.explanation}</p>

                {gap.verification_question && (
                  <div className="p-2.5 rounded bg-blue-950/20 border border-blue-500/20 text-[11px] space-y-1">
                    <span className="font-semibold text-blue-300">Clarification Question:</span>
                    <p className="text-slate-300">{gap.verification_question}</p>
                    {gap.user_response && (
                      <p className="text-emerald-400 pt-1">
                        <strong>Candidate Answer:</strong> {gap.user_response}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: ATS Report */}
      {activeTab === 'ats' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Internal ATS Heuristic Audit</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive evaluation of section structure, keywords, bullet quality, and parsing compatibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400">Keyword Density</span>
              <div className="text-xl font-bold text-blue-400">{atsReport.keyword_relevance_score}%</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400">Readability</span>
              <div className="text-xl font-bold text-emerald-400">{atsReport.readability_score}%</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400">Bullet Action Verbs</span>
              <div className="text-xl font-bold text-indigo-400">{atsReport.bullet_quality_score}%</div>
            </div>
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400">Parsing Compatibility</span>
              <div className="text-xl font-bold text-emerald-400">{atsReport.parsing_compatibility_status}</div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-300">Audit Findings:</h4>
            {atsReport.findings.map((f, i) => (
              <div key={i} className="p-2.5 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{f.message}</span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-500 leading-relaxed italic">
            {atsReport.disclaimer}
          </div>
        </div>
      )}
    </div>
  );
};
