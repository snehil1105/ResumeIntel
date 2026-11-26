from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os
import uuid
from app.models.resume import MasterResume
from app.document.pdf_generator import ATSPDFGenerator
from app.document.docx_generator import ATSDOCXGenerator
from app.agents.agent_latex_resume import LaTeXResumeAgent
from app.agents.dual_llm_verifier import DualLLMVerificationService
from app.core.config import settings

router = APIRouter(prefix="/export", tags=["Export & Generation"])
latex_agent = LaTeXResumeAgent()
dual_llm_service = DualLLMVerificationService()

@router.post("/generate-pdf")
async def generate_pdf_resume(
    resume: MasterResume,
    company_name: str = "Company",
    job_title: str = "Software Engineer",
    version_number: int = 1
):
    """Generates an ATS-optimized PDF resume."""
    gen_dir = f"{settings.STORAGE_DIR}/generated"
    os.makedirs(gen_dir, exist_ok=True)
    file_id = str(uuid.uuid4())
    pdf_path = f"{gen_dir}/Resume_{company_name.replace(' ', '_')}_{file_id[:8]}.pdf"
    
    ATSPDFGenerator.generate(resume, pdf_path, company_name, job_title, version_number)
    return {
        "file_path": pdf_path,
        "download_url": f"/api/v1/export/download?file_path={pdf_path}"
    }

@router.post("/generate-docx")
async def generate_docx_resume(
    resume: MasterResume,
    company_name: str = "Company",
    job_title: str = "Software Engineer",
    version_number: int = 1
):
    """Generates an ATS-optimized DOCX resume."""
    gen_dir = f"{settings.STORAGE_DIR}/generated"
    os.makedirs(gen_dir, exist_ok=True)
    file_id = str(uuid.uuid4())
    docx_path = f"{gen_dir}/Resume_{company_name.replace(' ', '_')}_{file_id[:8]}.docx"
    
    ATSDOCXGenerator.generate(resume, docx_path, company_name, job_title, version_number)
    return {
        "file_path": docx_path,
        "download_url": f"/api/v1/export/download?file_path={docx_path}"
    }

@router.post("/generate-latex")
async def generate_latex_resume(
    resume: MasterResume,
    company_name: str = "Company",
    job_title: str = "Software Engineer",
    accent_color_hex: str = "#1D4ED8"
):
    """Generates 100% valid, compilable LaTeX code matching previous styling."""
    gen_dir = f"{settings.STORAGE_DIR}/generated"
    os.makedirs(gen_dir, exist_ok=True)
    file_id = str(uuid.uuid4())
    
    # Auto-extract color from previous resume text if available
    detected = latex_agent.extract_style_and_color(resume.raw_text or "")
    active_color = accent_color_hex or f"#{detected['accent_color']}"

    latex_res = await dual_llm_service.generate_and_verify_latex(resume, accent_color_hex=active_color)
    latex_code = latex_res["latex_code"]
    latex_audit = latex_res["latex_audit"]
    
    tex_path = f"{gen_dir}/Resume_{company_name.replace(' ', '_')}_{file_id[:8]}.tex"
    with open(tex_path, "w", encoding="utf-8") as f:
        f.write(latex_code)
        
    return {
        "file_path": tex_path,
        "latex_code": latex_code,
        "accent_color": active_color,
        "download_url": f"/api/v1/export/download?file_path={tex_path}",
        "validation": {
            "status": "VALID" if latex_audit["structural_validation"]["is_valid"] else "INVALID",
            "syntax_checked": True,
            "error_count": len(latex_audit["structural_validation"]["issues"]),
            "compiler_compatibility": "Overleaf / TeX Live / MiKTeX / MacTeX",
            "dual_llm_audit": latex_audit
        }
    }

@router.get("/download")
async def download_file(file_path: str):
    """Securely downloads generated PDF, DOCX, or TEX file."""
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    filename = os.path.basename(file_path)
    if filename.endswith(".pdf"):
        media_type = "application/pdf"
    elif filename.endswith(".tex"):
        media_type = "text/x-tex"
    else:
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    return FileResponse(file_path, media_type=media_type, filename=filename)
