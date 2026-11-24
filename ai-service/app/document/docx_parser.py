import docx
from app.core.exceptions import DocumentParsingException

class DOCXParser:
    """Extracts text and bullet structures from DOCX documents."""
    @staticmethod
    def extract_text(file_path: str) -> str:
        try:
            doc = docx.Document(file_path)
            extracted_lines = []
            for para in doc.paragraphs:
                text = para.text.strip()
                if text:
                    extracted_lines.append(text)
            for table in doc.tables:
                for row in table.rows:
                    row_text = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                    if row_text:
                        extracted_lines.append(" | ".join(row_text))
            return "\n".join(extracted_lines)
        except Exception as e:
            raise DocumentParsingException(f"Error parsing DOCX file: {str(e)}")
