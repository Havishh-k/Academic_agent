RAG_SETTINGS = {
    # Chunking
    "chunk_size": 800,
    "chunk_overlap": 100,
    "min_chunk_size": 100,

    # Retrieval
    "retrieval_top_k": 5,
    "relevance_threshold": 0.7,

    # Hybrid Search
    "semantic_weight": 0.7,
    "keyword_weight": 0.3,

    # Context
    "max_context_tokens": 4000,
    "include_sources": True,
}

SOCRATIC_CONFIG = {
    "min_mastery_for_advanced": 0.7,
    "max_hints_per_query": 3,
    "encourage_self_discovery": True,
}

EMBEDDING_CONFIG = {
    "model": "models/text-embedding-004",
    "task_type_document": "retrieval_document",
    "task_type_query": "retrieval_query",
    "dimension": 768,
}

GEMINI_CONFIG = {
    "model": "gemini-2.0-flash",
    "temperature": 0.7,
    "max_output_tokens": 2048,
}
