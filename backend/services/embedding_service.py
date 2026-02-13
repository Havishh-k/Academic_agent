"""Embedding Service — Google Gemini embedding generation."""
import google.generativeai as genai
from typing import List
import asyncio

from config.settings import GEMINI_API_KEY
from config.rag_config import EMBEDDING_CONFIG


class EmbeddingService:
    """Generate vector embeddings using Google Gemini Embedding API."""

    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = EMBEDDING_CONFIG["model"]

    def generate_embedding(
        self, text: str, task_type: str = "retrieval_document"
    ) -> List[float]:
        """Generate embedding for a single text chunk."""
        result = genai.embed_content(
            model=self.model,
            content=text,
            task_type=task_type,
        )
        return result["embedding"]

    def generate_embeddings_batch(
        self,
        texts: List[str],
        task_type: str = "retrieval_document",
        batch_size: int = 50,
    ) -> List[List[float]]:
        """Generate embeddings for multiple texts in batches."""
        embeddings: List[List[float]] = []

        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]

            for text in batch:
                emb = self.generate_embedding(text, task_type)
                embeddings.append(emb)

            # Small delay between batches for rate limiting
            if i + batch_size < len(texts):
                import time
                time.sleep(0.5)

        return embeddings

    def embed_query(self, query: str) -> List[float]:
        """Generate embedding for a search query."""
        return self.generate_embedding(query, task_type="retrieval_query")
