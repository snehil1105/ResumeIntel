import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Building2, 
  Briefcase, 
  Link, 
  MapPin,
  Clock
} from 'lucide-react';
import { AgentProgressStepper, AgentStep } from '../components/AgentProgressStepper';

interface NewJobAnalysisPageProps {
  onWorkflowComplete: (workflowData: any) => void;
  onNavigate: (tab: string) => void;
}

export const NewJobAnalysisPage: React.FC<NewJobAnalysisPageProps> = ({
  onWorkflowComplete,
  onNavigate
}) => {
  const [companyName, setCompanyName] = useState('Google');
  const [jobTitle, setJobTitle] = useState('Software Engineering Intern - Backend');
  const [jobUrl, setJobUrl] = useState('https://careers.google.com/jobs/results/12345');
  const [location, setLocation] = useState('Mountain View, CA');
  const [seniorityLevel, setSeniorityLevel] = useState('Intern');
  const [rawJdText, setRawJdText] = useState(
`Google is looking for a Software Engineering Intern to join our Core Backend Systems infrastructure team.

Minimum Qualifications:
- Currently pursuing a Bachelor's or Master's degree in Computer Science, Computer Engineering, or related technical field.
- Experience with one or more general-purpose programming languages including Java, C++, Python, or Go.
- Solid foundational understanding of data structures, algorithms, and object-oriented design.
- Hands-on experience developing RESTful APIs or relational database applications (SQL / PostgreSQL).

Preferred Qualifications:
- Experience with distributed systems, microservices architecture, and RPC frameworks (gRPC).
- Familiarity with containerization (Docker) and Kubernetes orchestration.
- Demonstrated passion for scalable software engineering, code readability, and automated unit testing (JUnit).
- Prior internship or project experience designing high-throughput web services.`
  );

  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([
    { name: 'Resume Intelligence', role: 'Ingest & isolate protected fields', status: 'PENDING' },
    { name: 'JD Analysis Agent', role: 'Deconstruct mandatory vs preferred requirements', status: 'PENDING' },
    { name: 'Company Research Agent', role: 'Gather verifiable citations & tech stack patterns', status: 'PENDING' },
    { name: 'Candidate-Job Matching', role: 'Calculate multi-factor match score without hallucinations', status: 'PENDING' },
    { name: 'Skill Gap & Verification', role: 'Classify gaps into A-E & formulate candidate questions', status: 'PENDING' },
    { name: 'Project Optimization', role: 'Elevate STAR bullets within verified limits', status: 'PENDING' },
    { name: 'Resume Customizer', role: 'Formulate summary & skill hierarchy proposals', status: 'PENDING' },
    { name: 'ATS Evaluator Agent', role: 'Heuristic structural & keyword parsing audit', status: 'PENDING' },
    { name: 'Quality Reviewer Agent', role: 'Adversarial check: immutability & approval verification', status: 'PENDING' }
  ]);

  const handleStartAnalysis = async () => {
    setIsRunning(true);
    setCurrentStepIndex(0);

    const updatedSteps = [...agentSteps];

    // Simulated stepped progression with realistic agent timings
    for (let i = 0; i < updatedSteps.length; i++) {
      setCurrentStepIndex(i);
      updatedSteps[i].status = 'RUNNING';
      setAgentSteps([...updatedSteps]);

      await new Promise(r => setTimeout(r, 600));

      if (i === 6) {
        // Pauses at HITL checkpoint
        updatedSteps[i].status = 'COMPLETED';
        updatedSteps[i].summary = 'Generated role customization proposals. Pausing at Human Approval Gateway.';
        setAgentSteps([...updatedSteps]);
        break;
      } else {
        updatedSteps[i].status = 'COMPLETED';
        if (i === 0) updatedSteps[i].summary = 'Master resume verified. Protected fields locked.';
        if (i === 1) updatedSteps[i].summary = 'Identified 4 mandatory and 4 preferred requirements.';
        if (i === 2) updatedSteps[i].summary = 'Gathered 3 verifiable public sources with 88% confidence.';
        if (i === 3) updatedSteps[i].summary = 'Transparent match score computed: 82.5%.';
        if (i === 4) updatedSteps[i].summary = 'Classified missing skills (A-E) & generated 1 verification question.';
        if (i === 5) updatedSteps[i].summary = 'Formulated 2 STAR project bullet enhancements.';
        setAgentSteps([...updatedSteps]);
      }
    }

    setIsRunning(false);

    // Pass data to workflow
    const mockWorkflowResult = {
      companyName,
      jobTitle,
      rawJdText,
      matchScore: 82.5,
      completedStage: 'AWAITING_APPROVAL'
    };
    onWorkflowComplete(mockWorkflowResult);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">New Job Description Analysis</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Submit target job details to launch the 9-Agent LangGraph Orchestration pipeline. The agents will research company hiring practices, compute transparent matching scores, and prepare human-in-the-loop proposals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Submission Form */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Company Name</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Google, Microsoft, Amazon"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Target Job Title</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Java Backend Developer Intern"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Job Posting URL (Optional)</label>
              <div className="relative">
                <Link className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Location &amp; Seniority</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="Location"
                />
                <input
                  type="text"
                  value={seniorityLevel}
                  onChange={(e) => setSeniorityLevel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  placeholder="Seniority"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Job Description (Full Text)
            </label>
            <textarea
              rows={9}
              value={rawJdText}
              onChange={(e) => setRawJdText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-blue-500"
              placeholder="Paste the full job description text here..."
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-slate-500">
              * The multi-agent pipeline strictly adheres to factual verification standards.
            </p>
            <button
              onClick={handleStartAnalysis}
              disabled={isRunning || !companyName || !rawJdText}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
            >
              {isRunning ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Orchestrating 9 Agents...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Launch Multi-Agent Pipeline
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Col: Process Explanation & Quick Action */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white">How The Pipeline Works</h3>
            <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300 leading-relaxed">
              <li><strong>Resume Intelligence:</strong> Isolates protected personal &amp; academic fields.</li>
              <li><strong>JD Decomposition:</strong> Segregates mandatory from nice-to-have requirements.</li>
              <li><strong>Company Research:</strong> Queries engineering blogs and public hiring data with URL citations.</li>
              <li><strong>Candidate Matching:</strong> Computes transparent score without hallucinating skills.</li>
              <li><strong>Human Review:</strong> You approve or edit every proposed modification.</li>
            </ol>
          </div>

          {currentStepIndex >= 6 && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <CheckCircle className="w-4 h-4" />
                <span>Stage 1 Analysis Complete!</span>
              </div>
              <p className="text-xs text-slate-300">
                Recommendations and verifiable company intelligence have been indexed and are ready for your review.
              </p>
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => onNavigate('resume_studio')}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  Open Resume Studio (HITL)
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onNavigate('company_intelligence')}
                  className="w-full py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-medium text-xs transition-colors"
                >
                  Inspect Company Intelligence
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stepper Status Row */}
      <AgentProgressStepper steps={agentSteps} />
    </div>
  );
};
