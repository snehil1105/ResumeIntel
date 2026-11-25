import fitz # PyMuPDF
import re
from typing import Tuple, Dict, Any
from app.core.exceptions import DocumentParsingException

class PDFParser:
    """Extracts clean text and structural metadata (including clickable hyperlinks) from PDF resumes using PyMuPDF."""
    @staticmethod
    def extract_text(file_path: str) -> str:
        try:
            doc = fitz.open(file_path)
            extracted_text = []
            extracted_links = []
            for page in doc:
                text = page.get_text("text")
                if text:
                    extracted_text.append(text)
                for link in page.get_links():
                    uri = link.get("uri")
                    if uri and uri not in extracted_links:
                        extracted_links.append(uri)
            doc.close()
            full_text = "\n".join(extracted_text).strip()

            # De-hyphenate words broken by line wraps (e.g. "confirma-\ntion" -> "confirmation")
            full_text = re.sub(r'(\w+)-\s*\n\s*(\w+)', r'\1\2', full_text)

            if extracted_links:
                full_text += "\n\n--- EXTRACTED HYPERLINKS ---\n" + "\n".join(extracted_links)
            return full_text
        except Exception as e:
            raise DocumentParsingException(f"Error parsing PDF file: {str(e)}")
