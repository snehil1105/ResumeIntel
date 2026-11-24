from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import shutil
import os
import uuid
from app.document.pdf_parser import PDFParser
from app.document.docx_parser import DOCXParser
from app.agents.agent_1_resume_intelligence import ResumeIntelligenceAgent
from app.core.config import settings

router = APIRouter(prefix="/resume", tags=["Resume Intelligence"])
agent1 = ResumeIntelligenceAgent()

@router.post("/parse-file")
async def parse_resume_file(
    file: UploadFile = File(...),
    user_id: str = Form(...)
):
    """Parses uploaded PDF or DOCX resume into structured MasterResume schema."""
    filename = file.filename.lower()
    if not (filename.endswith(".pdf") or filename.endswith(".docx") or filename.endswith(".txt")):
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and TXT files are supported.")

    os.makedirs(f"{settings.STORAGE_DIR}/uploads", exist_ok=True)
    file_id = str(uuid.uuid4())
    temp_path = f"{settings.STORAGE_DIR}/uploads/{file_id}_{file.filename}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        if filename.endswith(".pdf"):
            extracted_text = PDFParser.extract_text(temp_path)
        elif filename.endswith(".docx"):
            extracted_text = DOCXParser.extract_text(temp_path)
        else:
            with open(temp_path, "r", encoding="utf-8", errors="ignore") as tf:
                extracted_text = tf.read()

        master_resume = agent1.extract_from_raw_text(extracted_text, user_id)
        return {
            "file_name": file.filename,
            "raw_text_length": len(extracted_text),
            "master_resume": master_resume
        }
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
