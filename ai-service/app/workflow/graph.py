import logging
import uuid
import copy
from typing import Dict, Any, List
from datetime import datetime

from app.workflow.state import WorkflowAgentState
from app.providers.llm_provider import get_llm_provider
from app.providers.search_provider import get_search_provider
from app.agents.agent_1_resume_intelligence import ResumeIntelligenceAgent
from app.agents.agent_2_jd_analysis import JobDescriptionAnalysisAgent
from app.agents.agent_3_company_research import CompanyIntelligenceResearchAgent
from app.agents.agent_4_matching import CandidateJobMatchingAgent
from app.agents.agent_5_skill_gap import SkillGapAnalysisAgent
from app.agents.agent_6_project_optimization import ProjectOptimizationAgent
from app.agents.agent_7_customization import ResumeCustomizationAgent
from app.agents.agent_8_ats_evaluator import ATSOptimizationAgent
from app.agents.agent_9_quality_reviewer import ResumeQualityReviewerAgent
from app.models.proposals import ApprovalStatus, ProposalSectionType, ChangeProposal
from app.models.resume import MasterResume

logger = logging.getLogger(__name__)

class ResumeIntelWorkflow:
    """
    Coordinates the 9 specialized agents in a reliable stateful pipeline.
    Supports asynchronous execution, checkpointing, and human-in-the-loop approvals.
    """
    def __init__(self):
        self.llm = get_llm_provider()
        self.search = get_search_provider()
        
        # Instantiate 9 Agents
        self.agent1 = ResumeIntelligenceAgent()
        self.agent2 = JobDescriptionAnalysisAgent(self.llm)
        self.agent3 = CompanyIntelligenceResearchAgent(self.search)
        self.agent4 = CandidateJobMatchingAgent()
        self.agent5 = SkillGapAnalysisAgent()
        self.agent6 = ProjectOptimizationAgent(self.llm)
        self.agent7 = ResumeCustomizationAgent()
        self.agent8 = ATSOptimizationAgent()
        self.agent9 = ResumeQualityReviewerAgent()

    async def run_analysis_pipeline(self, state: WorkflowAgentState) -> WorkflowAgentState:
        """
        Runs Stage 1: Extraction through Recommendation Generation.
        Pauses at the Human Approval Checkpoint so the user can inspect proposals.
        """
        logs = state.get("execution_logs", [])
        
        # Step 1: Ingest/Verify Master Resume
        t0 = datetime.utcnow()
        if "master_resume" not in state or not state["master_resume"]:
            raw_text = state.get("raw_resume_text", "")
            state["master_resume"] = self.agent1.extract_from_raw_text(raw_text, state["user_id"])
        logs.append({
            "agent": "Agent 1: Resume Intelligence",
            "status": "COMPLETED",
            "time_ms": int((datetime.utcnow() - t0).total_seconds() * 1000),
            "summary": "Master resume parsed and protected fields verified."
        })

        # Step 2: Analyze Job Description
        t0 = datetime.utcnow()
        job_input = state["job_input"]
        state["job_analysis"] = await self.agent2.analyze(job_input)
        logs.append({
            "agent": "Agent 2: Job Description Analysis",
            "status": "COMPLETED",
            "time_ms": int((datetime.utcnow() - t0).total_seconds() * 1000),
            "summary": f"Identified {len(state['job_analysis'].mandatory_skills)} mandatory and {len(state['job_analysis'].preferred_skills)} preferred skills."
        })

        # Step 3: Company Intelligence Research
        t0 = datetime.utcnow()
        state["company_research"] = await self.agent3.research(
            job_input.company_name,
            job_input.job_title,
            job_input.raw_jd_text
        )
        logs.append({
            "agent": "Agent 3: Company Research",
            "status": "COMPLETED",
            "time_ms": int((datetime.utcnow() - t0).total_seconds() * 1000),
            "summary": f"Gathered {len(state['company_research'].sources)} verifiable citations with {state['company_research'].overall_confidence_score * 100}% confidence."
        })

        # Step 4: Candidate-Job Matching
        t0 = datetime.utcnow()
        state["candidate_match"] = self.agent4.match(
            state["master_resume"],
            state["job_analysis"],
            state["company_research"]
        )
        match_report = state["candidate_match"]
        logs.append({
            "agent": "Agent 4: Candidate-Job Matching",
            "status": "COMPLETED" if match_report.is_domain_compatible else "DOMAIN_MISMATCH_DETECTED",
            "time_ms": int((datetime.utcnow() - t0).total_seconds() * 1000),
            "summary": f"Overall match score: {match_report.overall_match_score}%." if match_report.is_domain_compatible else f"Domain Mismatch: 0% vector alignment between {match_report.candidate_domain} and target role."
        })

        # DOMAIN COMPATIBILITY GATE:
        # If candidate domain and target JD domain have zero vector alignment (e.g. Content Creator vs SWE),
        # strictly halt customization to prevent skill fabrication or misrepresentation.
        if not match_report.is_domain_compatible:
            logs.append({
                "agent": "Factual Integrity Guard",
                "status": "HALTED",
                "time_ms": 0,
                "summary": "Resume tailoring intentionally stopped: Incompatible career domains. Zero hallucination policy enforced."
            })
            state["proposals"] = []
            state["execution_logs"] = logs
            state["status"] = "DOMAIN_MISMATCH_HALTED"
            state["current_step"] = "DOMAIN_INCOMPATIBILITY_STOP"
            return state

        # Step 5: Skill Gap Analysis & Question Generation
        t0 = datetime.utcnow()
        state["skill_gap_report"] = self.agent5.analyze_gaps(
            state["candidate_match"],
            state["master_resume"],
            state["job_analysis"]
        )
        logs.append({
            "agent": "Agent 5: Skill Gap Analysis",
            "status": "COMPLETED",
            "time_ms": int((datetime.utcnow() - t0).total_seconds() * 1000),
            "summary": f"Detected {state['skill_gap_report'].total_gaps_count} gaps across categories A-E. Generated {len(state['skill_gap_report'].pending_questions)} verification questions."
        })

        # Step 6: Project Optimization
        t0 = datetime.utcnow()
        proj_proposals = await self.agent6.optimize_projects(
            state["master_resume"],
            state["job_analysis"],
            state["company_research"],
            state.get("user_answers", {})
        )
        logs.append({
            "agent": "Agent 6: Project Optimization",
            "status": "COMPLETED",
            "time_ms": int((datetime.utcnow() - t0).total_seconds() * 1000),
            "summary": f"Generated {len(proj_proposals)} STAR project optimization recommendations."
        })

        # Step 7: Resume Customization Proposals
        t0 = datetime.utcnow()
        custom_proposals = self.agent7.generate_customizations(
            state["master_resume"],
            state["job_analysis"],
            state["company_research"],
            state.get("user_answers", {})
        )
        logs.append({
            "agent": "Agent 7: Resume Customization",
            "status": "COMPLETED",
            "time_ms": int((datetime.utcnow() - t0).total_seconds() * 1000),
            "summary": f"Formulated {len(custom_proposals)} targeted summary and skill hierarchy proposals."
        })

        state["proposals"] = proj_proposals + custom_proposals
        state["execution_logs"] = logs
        state["status"] = "AWAITING_APPROVAL"
        state["current_step"] = "HUMAN_APPROVAL_CHECKPOINT"
        return state

    async def apply_approvals_and_finalize(self, state: WorkflowAgentState) -> WorkflowAgentState:
        """
        Runs Stage 2: After user approves/edits proposals, synthesizes the customized resume,
        evaluates ATS heuristic, and executes adversarial quality review.
        """
        logs = state.get("execution_logs", [])
        master = state["master_resume"]
        
        # Deep copy to maintain Master Resume as pristine single source of truth
        customized = copy.deepcopy(master)
        
        # Filter strictly approved or edited proposals
        decisions = state.get("user_decisions", {})
        approved = []

        for p in state.get("proposals", []):
            decision = decisions.get(p.id)
            if decision:
                p.approval_status = ApprovalStatus(decision.get("action", "REJECTED"))
                if p.approval_status == ApprovalStatus.EDITED:
                    p.user_edited_content = decision.get("user_edited_content")
            
            # Apply only approved or edited changes
            if p.approval_status == ApprovalStatus.APPROVED:
                approved.append(p)
                self._apply_proposal_to_resume(customized, p, content=p.proposed_content)
            elif p.approval_status == ApprovalStatus.EDITED and p.user_edited_content:
                approved.append(p)
                self._apply_proposal_to_resume(customized, p, content=p.user_edited_content)

        state["approved_proposals"] = approved
        state["customized_resume"] = customized

        # Step 8: ATS Optimization Evaluation
        t0 = datetime.utcnow()
        state["ats_report"] = self.agent8.evaluate(customized, state["job_analysis"])
        logs.append({
            "agent": "Agent 8: ATS Optimization",
            "status": "COMPLETED",
            "time_ms": int((datetime.utcnow() - t0).total_seconds() * 1000),
            "summary": f"Evaluated ATS score: {state['ats_report'].overall_ats_score}/100."
        })

        # Step 9: Independent Adversarial Quality Review
        t0 = datetime.utcnow()
        is_valid, violations = self.agent9.review(master, customized, state.get("proposals", []))
        state["quality_violations"] = violations
        
        logs.append({
            "agent": "Agent 9: Quality & Factual Reviewer",
            "status": "COMPLETED" if is_valid else "FAILED",
            "time_ms": int((datetime.utcnow() - t0).total_seconds() * 1000),
            "summary": "Passed all factual integrity and immutability checks." if is_valid else f"Failed with {len(violations)} violations."
        })

        state["execution_logs"] = logs
        state["status"] = "COMPLETED" if is_valid else "FAILED"
        state["current_step"] = "FINISHED"
        return state

    def _apply_proposal_to_resume(self, resume: MasterResume, proposal: ChangeProposal, content: str):
        """Applies an approved modification strictly to non-protected fields."""
        if proposal.section_type == ProposalSectionType.PROFESSIONAL_SUMMARY:
            resume.professional_summary = content
            
        elif proposal.section_type == ProposalSectionType.PROJECT_BULLET:
            for proj in resume.projects:
                for idx, b in enumerate(proj.bullet_points):
                    if b.strip() == proposal.original_content.strip():
                        proj.bullet_points[idx] = content
                        return
                        
        elif proposal.section_type == ProposalSectionType.SKILLS_ORDERING:
            # Reorder skills based on content
            pass
