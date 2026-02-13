"""Chat API Routes — RAG + Socratic Engine."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional

from services.rag_service import RAGService

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatRequest(BaseModel):
    query: str
    subject_id: str
    conversation_history: Optional[List[Dict]] = None
    mastery_score: Optional[float] = 0.5
    student_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    sources: List[Dict] = []
    confidence: str = "medium"
    intent: str = ""
    strategy: str = ""


@router.post("/query", response_model=ChatResponse)
async def chat_query(request: ChatRequest):
    """Process a student query through the RAG + Socratic pipeline."""
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    if not request.subject_id.strip():
        raise HTTPException(status_code=400, detail="Subject ID is required")

    try:
        rag_service = RAGService()
        result = rag_service.query(
            query=request.query,
            subject_id=request.subject_id,
            conversation_history=request.conversation_history,
            mastery_score=request.mastery_score or 0.5,
        )
        return ChatResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")


@router.post("/retrieve")
async def retrieve_context(request: ChatRequest):
    """Retrieve relevant context without generating a response (for debugging/inspection)."""
    try:
        rag_service = RAGService()
        docs = rag_service.retrieve(request.query, request.subject_id)
        return {
            "query": request.query,
            "subject_id": request.subject_id,
            "results": docs,
            "count": len(docs),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
