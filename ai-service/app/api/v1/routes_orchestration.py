from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
import uuid
import logging

from pydantic import BaseModel
from app.workflow.state import WorkflowAgentState
from app.workflow.graph import ResumeIntelWorkflow
from app.models.job import JobDescriptionInput
from app.models.resume import MasterResume
from app.models.proposals import ProposalDecisionRequest
from app.agents.dual_llm_verifier import DualLLMVerificationService
from app.rag.vector_store import vector_store
from app.rag.chunker import ResumeChunker

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/workflow", tags=["Orchestration"])

# In-memory session state store (backed by Redis/PostgreSQL in prod)
active_workflows: Dict[str, WorkflowAgentState] = {}
workflow_engine = ResumeIntelWorkflow()
dual_llm_service = DualLLMVerificationService()


class TailorAndVerifyRequest(BaseModel):
    master_resume: MasterResume
    company_name: str
    job_title: str = "Software Engineer"
    job_description: str
    accent_color_hex: str = "000000"


@router.post("/tailor-and-verify")
async def tailor_and_verify(req: TailorAndVerifyRequest):
    """
    Dual-LLM Pipeline (Groq + Gemini):
    1. Groq reasons over JD + MasterResume to propose concrete, factual tailoring edits.
    2. Gemini double-checks every proposed change (rejecting no-op/fake tailoring & hallucinations).
    3. Groq generates LaTeX from the verified tailored resume.
    4. Gemini audits & corrects the LaTeX syntax/formatting, backed by a deterministic safety gate.
    """
    try:
        reasoning_res = await dual_llm_service.tailor_and_verify_resume(
            master_resume=req.master_resume,
            company_name=req.company_name,
            job_title=req.job_title,
            job_description=req.job_description,
        )
        tailored_resume: MasterResume = reasoning_res["tailored_resume"]

        latex_res = await dual_llm_service.generate_and_verify_latex(
            tailored_resume=tailored_resume,
            accent_color_hex=req.accent_color_hex,
        )

        return {
            "status": "SUCCESS",
            "tailored_resume": tailored_resume.model_dump(),
            "detailed_changes": reasoning_res["detailed_changes"],
            "latex_code": latex_res["latex_code"],
            "verification_report": {
                "reasoning_audit": reasoning_res["reasoning_audit"],
                "latex_audit": latex_res["latex_audit"],
            },
        }
    except Exception as e:
        logger.error(f"Error in tailor_and_verify: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/research-company")
async def research_company(company_name: str, job_title: str = "Software Engineer", job_description: str = ""):
    """
    Direct endpoint for Agent 3: Company Intelligence Research Agent.
    Gathers tech stack, hiring values, observed patterns, and citations for the company.
    """
    try:
        report = await workflow_engine.agent3.research(
            company_name=company_name,
            job_title=job_title,
            job_description=job_description
        )
        return {"status": "SUCCESS", "data": report.model_dump()}
    except Exception as e:
        logger.error(f"Error researching company {company_name}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/start")
async def start_analysis_pipeline(
    user_id: str,
    job_input: JobDescriptionInput,
    raw_resume_text: str = ""
):
    """
    Initiates Multi-Agent Orchestration through Stage 1.
    Runs Agents 1-7 and pauses at the Human Approval Checkpoint.
    """
    try:
        wf_id = str(uuid.uuid4())
        initial_state: WorkflowAgentState = {
            "workflow_id": wf_id,
            "user_id": user_id,
            "raw_resume_text": raw_resume_text,
            "job_input": job_input,
            "user_answers": {},
            "user_decisions": {},
            "execution_logs": [],
            "status": "IN_PROGRESS",
            "current_step": "START"
        }

        # Run Stage 1 (Agents 1-7)
        result_state = await workflow_engine.run_analysis_pipeline(initial_state)
        active_workflows[wf_id] = result_state

        # Index master resume in RAG store
        if "master_resume" in result_state:
            chunks = ResumeChunker.chunk_master_resume(result_state["master_resume"])
            vector_store.index_chunks(user_id, chunks)

        return {
            "workflow_id": wf_id,
            "status": result_state["status"],
            "current_step": result_state["current_step"],
            "master_resume": result_state.get("master_resume"),
            "job_analysis": result_state.get("job_analysis"),
            "company_research": result_state.get("company_research"),
            "candidate_match": result_state.get("candidate_match"),
            "skill_gap_report": result_state.get("skill_gap_report"),
            "proposals": result_state.get("proposals", []),
            "execution_logs": result_state.get("execution_logs", [])
        }
    except Exception as e:
        logger.error(f"Error in start_analysis_pipeline: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{workflow_id}/state")
async def get_workflow_state(workflow_id: str):
    """Retrieves current workflow state, logs, and artifacts."""
    if workflow_id not in active_workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return active_workflows[workflow_id]

@router.post("/{workflow_id}/submit-answers")
async def submit_candidate_answers(workflow_id: str, answers: Dict[str, str]):
    """Accepts candidate answers to verification questions (e.g. Docker usage)."""
    if workflow_id not in active_workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    state = active_workflows[workflow_id]
    state.setdefault("user_answers", {}).update(answers)
    return {"message": "Verification answers recorded", "answers": state["user_answers"]}

@router.post("/{workflow_id}/decide-proposals")
async def decide_proposals(workflow_id: str, decisions: List[ProposalDecisionRequest]):
    """
    Submits user HITL decisions (Approve, Reject, Edit, Save for Later) for change proposals.
    Executes Stage 2: Synthesis, ATS Evaluation (Agent 8), and Quality Audit (Agent 9).
    """
    if workflow_id not in active_workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    state = active_workflows[workflow_id]
    state["user_decisions"] = {d.proposal_id: d.model_dump() for d in decisions}

    # Run Stage 2
    final_state = await workflow_engine.apply_approvals_and_finalize(state)
    active_workflows[workflow_id] = final_state

    return {
        "workflow_id": workflow_id,
        "status": final_state["status"],
        "customized_resume": final_state.get("customized_resume"),
        "ats_report": final_state.get("ats_report"),
        "quality_violations": final_state.get("quality_violations", []),
        "execution_logs": final_state.get("execution_logs", [])
    }
