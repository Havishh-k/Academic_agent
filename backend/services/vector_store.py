"""Vector Store Service — Supabase pgvector operations via REST API."""
import httpx
from typing import List, Dict, Optional
import json

from config.settings import SUPABASE_URL, SUPABASE_ANON_KEY


def _headers() -> dict:
    """Common headers for Supabase REST API."""
    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


class VectorStore:
    """Interface to Supabase pgvector for storing and searching embeddings via REST."""

    def __init__(self):
        self.base_url = SUPABASE_URL
        self.rest_url = f"{SUPABASE_URL}/rest/v1"

    def store_chunks_with_embeddings(
        self,
        chunks: List[Dict],
        embeddings: List[List[float]],
        subject_id: str,
        source_document: str,
    ) -> List[Dict]:
        """Store document chunks with their embeddings in knowledge_base."""
        records = []
        for chunk, embedding in zip(chunks, embeddings):
            records.append({
                "course_id": subject_id,
                "title": chunk.get("metadata", {}).get("title", source_document),
                "content": chunk["text"],
                "chunk_index": chunk["index"],
                "embedding": json.dumps(embedding),
                "source_document": source_document,
                "metadata": chunk.get("metadata", {}),
            })

        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                f"{self.rest_url}/knowledge_base",
                headers=_headers(),
                json=records,
            )
            response.raise_for_status()
            return response.json()

    def similarity_search(
        self,
        query_embedding: List[float],
        subject_id: str,
        top_k: int = 5,
        threshold: float = 0.7,
    ) -> List[Dict]:
        """Search for similar chunks using the match_embeddings RPC function."""
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                f"{self.rest_url}/rpc/match_embeddings",
                headers=_headers(),
                json={
                    "query_embedding": json.dumps(query_embedding),
                    "filter_subject_id": subject_id,
                    "match_threshold": threshold,
                    "match_count": top_k,
                },
            )
            response.raise_for_status()
            return response.json() or []

    def keyword_search(
        self,
        query: str,
        subject_id: str,
        limit: int = 10,
    ) -> List[Dict]:
        """Keyword search on knowledge_base content."""
        with httpx.Client(timeout=30.0) as client:
            params = {
                "select": "id,course_id,title,content,chunk_index,source_document,metadata",
                "course_id": f"eq.{subject_id}",
                "content": f"ilike.*{query.replace(' ', '*')}*",
                "limit": str(limit),
            }
            response = client.get(
                f"{self.rest_url}/knowledge_base",
                headers=_headers(),
                params=params,
            )
            response.raise_for_status()
            return response.json() or []

    def hybrid_search(
        self,
        query: str,
        query_embedding: List[float],
        subject_id: str,
        top_k: int = 5,
        threshold: float = 0.7,
    ) -> List[Dict]:
        """Combine semantic + keyword search with re-ranking."""
        semantic_results = self.similarity_search(
            query_embedding, subject_id, top_k * 2, threshold
        )

        keyword_results = self.keyword_search(query, subject_id, top_k * 2)

        return self._merge_results(semantic_results, keyword_results, top_k)

    @staticmethod
    def _merge_results(
        semantic: List[Dict], keyword: List[Dict], top_k: int
    ) -> List[Dict]:
        """Merge and re-rank search results, prioritizing semantic matches."""
        seen_ids = set()
        merged = []

        for result in semantic:
            rid = str(result.get("id", ""))
            if rid and rid not in seen_ids:
                result["score"] = result.get("similarity", 0) * 0.7
                merged.append(result)
                seen_ids.add(rid)

        for result in keyword:
            rid = str(result.get("id", ""))
            if rid and rid not in seen_ids:
                result["score"] = 0.3
                merged.append(result)
                seen_ids.add(rid)

        merged.sort(key=lambda x: x.get("score", 0), reverse=True)
        return merged[:top_k]
