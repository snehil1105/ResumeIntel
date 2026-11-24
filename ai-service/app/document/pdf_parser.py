import fitz # PyMuPDF
from typing import Tuple, Dict, Any
from app.core.exceptions import DocumentParsingException

class PDFParser:
    """Extracts clean text and structural metadata from PDF resumes using PyMuPDF."""
    @staticmethod
    def extract_text(file_path: str) -> str:
        try:
            doc = fitz.open(file_path)
            extracted_text = []
            for page in doc:
                text = page.get_text("text")
                if text:
                    extracted_text.append(text)
            doc.close()
            return "\n".join(extracted_text).strip()
        except Exception as e:
            raise DocumentParsingException(f"Error parsing PDF file: {str(e)}")
