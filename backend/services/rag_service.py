"""RAG Service — Full retrieval-augmented generation pipeline."""
from typing import List, Dict, Optional

from services.embedding_service import EmbeddingService
from services.vector_store import VectorStore
from services.socratic_engine import SocraticEngine
from config.rag_config import RAG_SETTINGS


class RAGService:
    """Orchestrates the full RAG pipeline: retrieve → assemble → generate."""

    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.vector_store = VectorStore()
        self.socratic_engine = SocraticEngine()

    def retrieve(
        self, query: str, subject_id: str, top_k: int = None
    ) -> List[Dict]:
        """Retrieve relevant context for a query."""
        top_k = top_k or RAG_SETTINGS["retrieval_top_k"]
        threshold = RAG_SETTINGS["relevance_threshold"]

        # Generate query embedding
        query_embedding = self.embedding_service.embed_query(query)

        # Hybrid search (semantic + keyword)
        results = self.vector_store.hybrid_search(
            query=query,
            query_embedding=query_embedding,
            subject_id=subject_id,
            top_k=top_k,
            threshold=threshold,
        )

        return results

    @staticmethod
    def assemble_context(retrieved_docs: List[Dict]) -> str:
        """Assemble retrieved chunks into a formatted context string."""
        if not retrieved_docs:
            return ""

        context_parts = []
        for i, doc in enumerate(retrieved_docs, 1):
            score = doc.get("score", 0) or doc.get("similarity", 0)
            source = doc.get("source_document", "Unknown")
            text = doc.get("content", "") or doc.get("chunk_text", "")
            context_parts.append(
                f"[Source {i}: {source}] (Relevance: {score:.2f})\n{text}"
            )

        return "\n\n---\n\n".join(context_parts)

    def query(
        self,
        query: str,
        subject_id: str,
        conversation_history: Optional[List[Dict]] = None,
        mastery_score: float = 0.5,
    ) -> Dict:
        """Full RAG + Socratic pipeline."""
        # 1. Retrieve relevant context
        retrieved_docs = self.retrieve(query, subject_id)

        # 2. Check curriculum boundary
        boundary_check = self.socratic_engine.check_curriculum_boundary(
            retrieved_docs, subject_id
        )
        if not boundary_check.get("allowed"):
            return {
                "response": boundary_check["response"],
                "sources": [],
                "confidence": "low",
                "intent": "out_of_scope",
                "strategy": "boundary_enforcement",
            }

        # 3. Assemble context
        context = self.assemble_context(retrieved_docs)

        # 4. Generate Socratic response
        result = self.socratic_engine.generate_response(
            query=query,
            context=context,
            conversation_history=conversation_history,
            mastery_score=mastery_score,
        )

        # 5. Format sources
        sources = [
            {
                "source_document": doc.get("source_document", ""),
                "relevance": doc.get("score", 0) or doc.get("similarity", 0),
                "snippet": (doc.get("content", "") or doc.get("chunk_text", ""))[:200] + "...",
            }
            for doc in retrieved_docs[:3]
        ]

        top_score = max(
            (doc.get("score", 0) or doc.get("similarity", 0) for doc in retrieved_docs),
            default=0,
        )

        return {
            "response": result["response"],
            "sources": sources,
            "confidence": "high" if top_score > 0.8 else "medium",
            "intent": result["intent"],
            "strategy": result["strategy"],
        }
