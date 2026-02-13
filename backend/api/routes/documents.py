"""Document Upload API Routes."""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import httpx
from services.document_processor import DocumentProcessor
from services.embedding_service import EmbeddingService
from services.vector_store import VectorStore
from config.rag_config import RAG_SETTINGS
from config.settings import SUPABASE_URL, SUPABASE_ANON_KEY

router = APIRouter(prefix="/api/documents", tags=["documents"])


def _headers():
    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    subject_id: str = Form(...),
):
    """Upload a PDF, extract text, chunk, embed, and store in knowledge_base."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        # Read file bytes
        pdf_bytes = await file.read()

        # 1. Extract text
        processor = DocumentProcessor(
            chunk_size=RAG_SETTINGS["chunk_size"],
            chunk_overlap=RAG_SETTINGS["chunk_overlap"],
        )
        extracted = processor.extract_text_from_bytes(pdf_bytes, file.filename)

        if not extracted["text"] or len(extracted["text"]) < 50:
            raise HTTPException(status_code=422, detail="Could not extract meaningful text from the PDF")

        # 2. Chunk
        chunks = processor.chunk_text(extracted["text"], extracted["metadata"])

        if not chunks:
            raise HTTPException(status_code=422, detail="No chunks generated from the document")

        # 3. Generate embeddings
        embedding_service = EmbeddingService()
        chunk_texts = [c["text"] for c in chunks]
        embeddings = embedding_service.generate_embeddings_batch(chunk_texts)

        # 4. Store in vector DB
        vector_store = VectorStore()
        stored = vector_store.store_chunks_with_embeddings(
            chunks=chunks,
            embeddings=embeddings,
            subject_id=subject_id,
            source_document=file.filename,
        )

        return {
            "status": "success",
            "filename": file.filename,
            "chunks_processed": len(chunks),
            "pages": extracted["metadata"].get("total_pages", 0),
            "stored_records": len(stored) if stored else 0,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Document processing failed: {str(e)}")


@router.get("/stats/{subject_id}")
async def get_document_stats(subject_id: str):
    """Get document statistics for a subject via REST API."""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.get(
                f"{SUPABASE_URL}/rest/v1/knowledge_base",
                headers=_headers(),
                params={
                    "select": "id,source_document,created_at",
                    "course_id": f"eq.{subject_id}",
                },
            )
            res.raise_for_status()
            data = res.json()

        docs = {}
        for row in data:
            src = row.get("source_document", "Unknown")
            if src not in docs:
                docs[src] = {"document": src, "chunks": 0, "uploaded_at": row.get("created_at")}
            docs[src]["chunks"] += 1

        return {
            "subject_id": subject_id,
            "total_chunks": len(data),
            "documents": list(docs.values()),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{document_name}")
async def delete_document(document_name: str, subject_id: str):
    """
    Delete a document and cascade-remove all its embedding chunks.
    Matched by source_document name + course_id.
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.delete(
                f"{SUPABASE_URL}/rest/v1/knowledge_base",
                headers=_headers(),
                params={
                    "source_document": f"eq.{document_name}",
                    "course_id": f"eq.{subject_id}",
                },
            )
            res.raise_for_status()
            deleted = res.json()

        return {
            "status": "deleted",
            "document": document_name,
            "chunks_removed": len(deleted) if deleted else 0,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

