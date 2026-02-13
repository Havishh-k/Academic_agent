"""Document Processing Service — PDF extraction and chunking."""
import re
from typing import List, Dict, Optional

try:
    from pypdf import PdfReader
    HAS_PYPDF = True
except ImportError:
    HAS_PYPDF = False

try:
    import fitz  # PyMuPDF
    HAS_FITZ = True
except ImportError:
    HAS_FITZ = False


class DocumentProcessor:
    """Extracts text from PDFs and splits into semantically meaningful chunks."""

    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def extract_text_from_bytes(self, pdf_bytes: bytes, filename: str = "") -> Dict:
        """Extract text from PDF bytes (for file uploads)."""
        if HAS_FITZ:
            return self._extract_with_fitz(pdf_bytes, filename)
        elif HAS_PYPDF:
            return self._extract_with_pypdf(pdf_bytes, filename)
        else:
            raise ImportError("No PDF library available. Install pypdf or PyMuPDF.")

    def _extract_with_pypdf(self, pdf_bytes: bytes, filename: str = "") -> Dict:
        """Extract text using pypdf (pure Python, works on all platforms)."""
        import io
        reader = PdfReader(io.BytesIO(pdf_bytes))

        full_text = ""
        metadata = {
            "total_pages": len(reader.pages),
            "title": filename,
            "author": "",
        }

        if reader.metadata:
            metadata["title"] = reader.metadata.get("/Title", "") or filename
            metadata["author"] = reader.metadata.get("/Author", "") or ""

        for page_num, page in enumerate(reader.pages, 1):
            text = page.extract_text() or ""
            full_text += f"\n\n[Page {page_num}]\n{text}"

        return {
            "text": self.clean_text(full_text),
            "metadata": metadata,
        }

    def _extract_with_fitz(self, pdf_bytes: bytes, filename: str = "") -> Dict:
        """Extract text using PyMuPDF (faster, better quality)."""
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        full_text = ""
        metadata = {
            "total_pages": len(doc),
            "title": doc.metadata.get("title", "") or filename,
            "author": doc.metadata.get("author", "") or "",
        }

        for page_num, page in enumerate(doc, 1):
            text = page.get_text()
            full_text += f"\n\n[Page {page_num}]\n{text}"

        doc.close()

        return {
            "text": self.clean_text(full_text),
            "metadata": metadata,
        }

    @staticmethod
    def clean_text(text: str) -> str:
        """Remove noise from extracted text."""
        text = re.sub(r"\s+", " ", text)
        text = re.sub(r"\[Page \d+\]\s*\d+", "", text)
        text = text.replace("\x00", "")
        return text.strip()

    def chunk_text(self, text: str, metadata: Optional[Dict] = None) -> List[Dict]:
        """Split text into overlapping chunks respecting paragraph boundaries."""
        paragraphs = re.split(r"\n{2,}", text)

        chunks: List[Dict] = []
        current_chunk = ""
        chunk_index = 0

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            if len(current_chunk) + len(para) > self.chunk_size and current_chunk:
                chunks.append({
                    "text": current_chunk.strip(),
                    "index": chunk_index,
                    "metadata": metadata or {},
                })
                chunk_index += 1

                overlap_words = current_chunk.split()[-self.chunk_overlap:]
                current_chunk = " ".join(overlap_words) + " " + para
            else:
                current_chunk += " " + para if current_chunk else para

        if current_chunk.strip():
            chunks.append({
                "text": current_chunk.strip(),
                "index": chunk_index,
                "metadata": metadata or {},
            })

        return chunks
