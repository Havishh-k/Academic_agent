# Phase 2: Code Templates & Starter Files

## Directory Structure

```
phase2/
├── services/
│   ├── document_processor.py      # PDF processing & chunking
│   ├── embedding_service.py       # Gemini embedding generation
│   ├── vector_store.py            # Supabase vector operations
│   ├── rag_service.py             # RAG orchestration
│   ├── socratic_engine.py         # Socratic logic
│   ├── quiz_generator.py          # Quiz generation
│   └── plantuml_service.py        # Diagram generation
├── models/
│   ├── documents.py               # Document models
│   ├── conversations.py           # Conversation state
│   └── quizzes.py                 # Quiz models
├── prompts/
│   ├── socratic_prompts.py        # Socratic templates
│   └── quiz_prompts.py            # Quiz generation templates
├── api/
│   ├── routes/
│   │   ├── documents.py           # Document upload routes
│   │   ├── chat.py                # Chat/RAG routes
│   │   └── quiz.py                # Quiz routes
│   └── dependencies.py            # FastAPI dependencies
├── config/
│   ├── langchain_config.py        # LangChain setup
│   └── rag_config.py              # RAG parameters
└── tests/
    ├── test_rag.py
    ├── test_socratic.py
    └── test_quiz.py
```

---

## 1. Document Processing Service

```python
# services/document_processor.py
import fitz  # PyMuPDF
from typing import List, Dict
import re

class DocumentProcessor:
    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def extract_text_from_pdf(self, pdf_path: str) -> Dict:
        """Extract text and metadata from PDF"""
        doc = fitz.open(pdf_path)
        
        full_text = ""
        metadata = {
            "total_pages": len(doc),
            "title": doc.metadata.get("title", ""),
            "author": doc.metadata.get("author", ""),
        }
        
        for page_num, page in enumerate(doc, 1):
            text = page.get_text()
            full_text += f"\n\n[Page {page_num}]\n{text}"
        
        doc.close()
        
        return {
            "text": self.clean_text(full_text),
            "metadata": metadata
        }
    
    def clean_text(self, text: str) -> str:
        """Clean extracted text"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove page numbers (simple pattern)
        text = re.sub(r'\[Page \d+\]\s*\d+', '', text)
        # Remove common artifacts
        text = text.replace('\x00', '')
        
        return text.strip()
    
    def chunk_text(self, text: str, metadata: Dict = None) -> List[Dict]:
        """Split text into semantically meaningful chunks"""
        # Split on paragraph boundaries first
        paragraphs = text.split('\n\n')
        
        chunks = []
        current_chunk = ""
        chunk_index = 0
        
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            
            # If adding this paragraph exceeds chunk size, save current chunk
            if len(current_chunk) + len(para) > self.chunk_size and current_chunk:
                chunks.append({
                    "text": current_chunk,
                    "index": chunk_index,
                    "metadata": metadata or {}
                })
                chunk_index += 1
                
                # Start new chunk with overlap
                overlap_words = current_chunk.split()[-self.chunk_overlap:]
                current_chunk = " ".join(overlap_words) + " " + para
            else:
                current_chunk += " " + para if current_chunk else para
        
        # Add final chunk
        if current_chunk:
            chunks.append({
                "text": current_chunk,
                "index": chunk_index,
                "metadata": metadata or {}
            })
        
        return chunks
    
    def extract_hierarchical_structure(self, text: str) -> Dict:
        """Extract document structure (chapters, sections)"""
        # Simple heading detection
        lines = text.split('\n')
        structure = {
            "chapters": [],
            "sections": []
        }
        
        for i, line in enumerate(lines):
            line = line.strip()
            # Detect headings (all caps, or numbered)
            if re.match(r'^(CHAPTER|Chapter)\s+\d+', line):
                structure["chapters"].append({"title": line, "line": i})
            elif re.match(r'^\d+\.\d+\s+[A-Z]', line):
                structure["sections"].append({"title": line, "line": i})
        
        return structure
```

---

## 2. Embedding Service

```python
# services/embedding_service.py
import google.generativeai as genai
from typing import List
import asyncio
from config.langchain_config import GEMINI_API_KEY

class EmbeddingService:
    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = "models/embedding-001"
    
    async def generate_embedding(self, text: str, task_type: str = "retrieval_document") -> List[float]:
        """Generate embedding for a single text"""
        result = genai.embed_content(
            model=self.model,
            content=text,
            task_type=task_type
        )
        return result['embedding']
    
    async def generate_embeddings_batch(
        self, 
        texts: List[str], 
        task_type: str = "retrieval_document",
        batch_size: int = 100
    ) -> List[List[float]]:
        """Generate embeddings for multiple texts in batches"""
        embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i + batch_size]
            
            # Process batch
            batch_embeddings = await asyncio.gather(*[
                self.generate_embedding(text, task_type)
                for text in batch
            ])
            
            embeddings.extend(batch_embeddings)
            
            # Rate limiting
            if i + batch_size < len(texts):
                await asyncio.sleep(1)
        
        return embeddings
    
    async def embed_query(self, query: str) -> List[float]:
        """Generate embedding for search query"""
        return await self.generate_embedding(query, task_type="retrieval_query")
```

---

## 3. Vector Store Service

```python
# services/vector_store.py
from supabase import Client
from typing import List, Dict, Optional
import numpy as np

class VectorStore:
    def __init__(self, supabase_client: Client):
        self.client = supabase_client
    
    async def store_embeddings(
        self, 
        document_id: str,
        chunks: List[Dict],
        embeddings: List[List[float]],
        subject_id: str
    ):
        """Store document chunks with embeddings"""
        records = []
        
        for chunk, embedding in zip(chunks, embeddings):
            records.append({
                "document_id": document_id,
                "chunk_text": chunk["text"],
                "chunk_index": chunk["index"],
                "embedding": embedding,
                "metadata": chunk.get("metadata", {}),
                "subject_id": subject_id
            })
        
        # Batch insert
        result = self.client.table("embeddings").insert(records).execute()
        return result.data
    
    async def similarity_search(
        self,
        query_embedding: List[float],
        subject_id: str,
        top_k: int = 5,
        threshold: float = 0.7
    ) -> List[Dict]:
        """Search for similar chunks using cosine similarity"""
        
        # Convert to pgvector format
        query_vec = f"[{','.join(map(str, query_embedding))}]"
        
        # Use Supabase RPC for vector similarity search
        result = self.client.rpc(
            'match_embeddings',
            {
                'query_embedding': query_vec,
                'subject_id': subject_id,
                'match_threshold': threshold,
                'match_count': top_k
            }
        ).execute()
        
        return result.data
    
    async def hybrid_search(
        self,
        query: str,
        query_embedding: List[float],
        subject_id: str,
        top_k: int = 5
    ) -> List[Dict]:
        """Combine semantic and keyword search"""
        
        # Semantic search
        semantic_results = await self.similarity_search(
            query_embedding, subject_id, top_k * 2
        )
        
        # Keyword search (full-text search on chunk_text)
        keyword_results = self.client.table("embeddings") \
            .select("*") \
            .text_search("chunk_text", query) \
            .eq("subject_id", subject_id) \
            .limit(top_k * 2) \
            .execute()
        
        # Merge and re-rank
        combined = self._merge_results(
            semantic_results, 
            keyword_results.data
        )
        
        return combined[:top_k]
    
    def _merge_results(self, semantic: List, keyword: List) -> List:
        """Merge and re-rank search results"""
        # Simple merging: combine unique results, prioritize semantic
        seen_ids = set()
        merged = []
        
        for result in semantic:
            if result['id'] not in seen_ids:
                result['score'] = result.get('similarity', 0) * 0.7
                merged.append(result)
                seen_ids.add(result['id'])
        
        for result in keyword:
            if result['id'] not in seen_ids:
                result['score'] = 0.3  # Lower weight for keyword match
                merged.append(result)
                seen_ids.add(result['id'])
        
        # Sort by combined score
        merged.sort(key=lambda x: x['score'], reverse=True)
        return merged


# SQL function for vector similarity (run in Supabase SQL Editor)
"""
CREATE OR REPLACE FUNCTION match_embeddings(
  query_embedding vector(768),
  subject_id uuid,
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  chunk_text text,
  chunk_index int,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.document_id,
    e.chunk_text,
    e.chunk_index,
    e.metadata,
    1 - (e.embedding <=> query_embedding) as similarity
  FROM embeddings e
  WHERE e.subject_id = match_embeddings.subject_id
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
"""
```

---

## 4. RAG Service

```python
# services/rag_service.py
from services.embedding_service import EmbeddingService
from services.vector_store import VectorStore
from typing import List, Dict
import google.generativeai as genai

class RAGService:
    def __init__(self, embedding_service: EmbeddingService, vector_store: VectorStore):
        self.embedding_service = embedding_service
        self.vector_store = vector_store
        genai.configure(api_key=GEMINI_API_KEY)
        self.llm = genai.GenerativeModel('gemini-1.5-flash')
    
    async def retrieve(self, query: str, subject_id: str, top_k: int = 5) -> List[Dict]:
        """Retrieve relevant context for query"""
        # Generate query embedding
        query_embedding = await self.embedding_service.embed_query(query)
        
        # Search vector store
        results = await self.vector_store.hybrid_search(
            query, query_embedding, subject_id, top_k
        )
        
        return results
    
    def assemble_context(self, retrieved_docs: List[Dict]) -> str:
        """Assemble context from retrieved documents"""
        context_parts = []
        
        for i, doc in enumerate(retrieved_docs, 1):
            context_parts.append(
                f"[Source {i}] (Relevance: {doc.get('score', 0):.2f})\n"
                f"{doc['chunk_text']}\n"
            )
        
        return "\n---\n".join(context_parts)
    
    async def generate_response(
        self, 
        query: str, 
        context: str, 
        conversation_history: List[Dict] = None
    ) -> str:
        """Generate LLM response with context"""
        
        system_prompt = """
        You are a university academic assistant. Your role is to help students learn 
        by guiding them to discover answers, not by giving direct solutions.
        
        STRICT RULES:
        1. ONLY use information from the provided context
        2. If the context doesn't contain the answer, say so explicitly
        3. Use the Socratic method: ask guiding questions
        4. Break down complex topics into steps
        5. Never fabricate information
        
        Context from curriculum materials:
        {context}
        """
        
        full_prompt = system_prompt.format(context=context)
        
        # Add conversation history if available
        if conversation_history:
            history_text = "\n".join([
                f"{'Student' if msg['role'] == 'user' else 'Assistant'}: {msg['content']}"
                for msg in conversation_history[-5:]  # Last 5 messages
            ])
            full_prompt += f"\n\nConversation History:\n{history_text}"
        
        full_prompt += f"\n\nStudent Question: {query}\n\nYour Response:"
        
        # Generate response
        response = self.llm.generate_content(full_prompt)
        
        return response.text
    
    async def query(
        self, 
        query: str, 
        subject_id: str, 
        conversation_history: List[Dict] = None
    ) -> Dict:
        """Full RAG pipeline"""
        
        # Retrieve relevant context
        retrieved_docs = await self.retrieve(query, subject_id)
        
        # Check if we have relevant context
        if not retrieved_docs or max(doc.get('score', 0) for doc in retrieved_docs) < 0.7:
            return {
                "response": "I don't have information about this topic in our curriculum materials. Could you ask about a topic we've covered in class?",
                "sources": [],
                "confidence": "low"
            }
        
        # Assemble context
        context = self.assemble_context(retrieved_docs)
        
        # Generate response
        response = await self.generate_response(query, context, conversation_history)
        
        return {
            "response": response,
            "sources": [
                {
                    "document_id": doc['document_id'],
                    "relevance": doc.get('score', 0),
                    "snippet": doc['chunk_text'][:200] + "..."
                }
                for doc in retrieved_docs
            ],
            "confidence": "high" if retrieved_docs[0].get('score', 0) > 0.8 else "medium"
        }
```

---

## 5. Socratic Engine

```python
# services/socratic_engine.py
from enum import Enum
from typing import Dict, List
import google.generativeai as genai

class Intent(Enum):
    CONCEPTUAL = "conceptual_understanding"
    PROBLEM_SOLVING = "problem_solving"
    CLARIFICATION = "clarification"
    VERIFICATION = "verification"

class SocraticStrategy(Enum):
    GUIDED_DISCOVERY = "guided_discovery"
    PROBLEM_DECOMPOSITION = "problem_decomposition"
    PROBING_QUESTIONS = "probing_questions"
    CONTEXTUAL_HINTS = "contextual_hints"

class SocraticEngine:
    def __init__(self):
        self.llm = genai.GenerativeModel('gemini-1.5-flash')
    
    async def classify_intent(self, query: str) -> Intent:
        """Classify student query intent"""
        prompt = f"""
        Classify this student query into ONE of these categories:
        - conceptual_understanding: Asking what something is or how it works
        - problem_solving: Asking how to solve a specific problem
        - clarification: Asking why something works a certain way
        - verification: Asking if their solution/understanding is correct
        
        Query: "{query}"
        
        Return ONLY the category name, nothing else.
        """
        
        response = self.llm.generate_content(prompt)
        intent_str = response.text.strip().lower()
        
        intent_map = {
            "conceptual_understanding": Intent.CONCEPTUAL,
            "problem_solving": Intent.PROBLEM_SOLVING,
            "clarification": Intent.CLARIFICATION,
            "verification": Intent.VERIFICATION
        }
        
        return intent_map.get(intent_str, Intent.CONCEPTUAL)
    
    def select_strategy(self, intent: Intent, mastery_score: float) -> SocraticStrategy:
        """Select appropriate Socratic strategy"""
        if intent == Intent.CONCEPTUAL:
            return SocraticStrategy.GUIDED_DISCOVERY
        elif intent == Intent.PROBLEM_SOLVING:
            return SocraticStrategy.PROBLEM_DECOMPOSITION
        elif intent == Intent.VERIFICATION:
            return SocraticStrategy.PROBING_QUESTIONS
        else:
            # For clarification, adapt based on mastery
            if mastery_score < 0.5:
                return SocraticStrategy.CONTEXTUAL_HINTS
            else:
                return SocraticStrategy.PROBING_QUESTIONS
    
    def build_socratic_prompt(self, strategy: SocraticStrategy, context: str) -> str:
        """Build strategy-specific prompt"""
        
        base_rules = """
        CORE PRINCIPLES:
        1. NEVER give direct answers
        2. Guide through questions
        3. Use ONLY information from the provided context
        4. If context doesn't have the answer, say so clearly
        5. Encourage critical thinking
        
        Context from curriculum:
        {context}
        """
        
        strategy_prompts = {
            SocraticStrategy.GUIDED_DISCOVERY: """
            GUIDED DISCOVERY Strategy:
            1. Acknowledge their question
            2. Ask 2-3 questions that break down the concept
            3. Guide them to connect ideas
            4. Let THEM state the conclusion
            
            Example:
            Student: "What is recursion?"
            You: "Great question! Let's explore this:
                 1. Have you ever seen those Russian nesting dolls? What pattern do you notice?
                 2. How might this idea of 'something containing smaller versions of itself' apply to functions?
                 3. Can you think of a problem that could be solved by breaking it into smaller, similar problems?"
            """,
            
            SocraticStrategy.PROBLEM_DECOMPOSITION: """
            PROBLEM DECOMPOSITION Strategy:
            1. Break the problem into clear steps
            2. Ask guiding questions for EACH step
            3. Let them solve each piece
            4. Help them connect the pieces
            
            Example:
            Student: "How do I implement quicksort?"
            You: "Let's break quicksort into its key steps:
                 Step 1: What element do we choose first? (Think about the name 'pivot')
                 Step 2: Once we have that element, what do we do with the rest of the array?
                 Step 3: What pattern do you see here? Does it look familiar?"
            """,
            
            SocraticStrategy.PROBING_QUESTIONS: """
            PROBING QUESTIONS Strategy:
            1. Ask questions that test their understanding
            2. Explore edge cases
            3. Challenge assumptions
            4. Guide them to self-correct
            
            Example:
            Student: "Is my solution correct?"
            You: "Let's verify together:
                 1. What's the time complexity of your approach?
                 2. What happens if the input is empty?
                 3. Walk me through your logic with this example: [edge case]
                 4. Do you see any issues when you trace through it?"
            """,
            
            SocraticStrategy.CONTEXTUAL_HINTS: """
            CONTEXTUAL HINTS Strategy:
            1. Provide progressive hints
            2. Start broad, get specific if needed
            3. Reference related concepts they know
            4. Encourage them to try before next hint
            
            Example:
            Student: "I'm stuck on this dynamic programming problem"
            You: "Let's think about this systematically:
                 Hint 1: What's the simplest version of this problem? (Base case)
                 Hint 2: If you knew the answer for a smaller input, how would you build up?
                 Hint 3: Could you store previous results to avoid recalculation?
                 Try working through it with these hints, and let me know what you come up with!"
            """
        }
        
        full_prompt = base_rules.format(context=context)
        full_prompt += "\n\n" + strategy_prompts[strategy]
        
        return full_prompt
    
    async def generate_socratic_response(
        self,
        query: str,
        context: str,
        mastery_score: float = 0.5
    ) -> Dict:
        """Generate Socratic response"""
        
        # Classify intent
        intent = await self.classify_intent(query)
        
        # Select strategy
        strategy = self.select_strategy(intent, mastery_score)
        
        # Build prompt
        system_prompt = self.build_socratic_prompt(strategy, context)
        
        full_prompt = f"{system_prompt}\n\nStudent Question: {query}\n\nYour Socratic Response:"
        
        # Generate response
        response = self.llm.generate_content(full_prompt)
        
        return {
            "response": response.text,
            "intent": intent.value,
            "strategy": strategy.value,
            "mastery_considered": mastery_score
        }
```

---

## 6. Configuration Files

```python
# config/langchain_config.py
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

GEMINI_CONFIG = {
    "model": "gemini-1.5-flash",
    "temperature": 0.7,
    "max_tokens": 2048,
    "top_p": 0.95
}

EMBEDDING_CONFIG = {
    "model": "models/embedding-001",
    "task_type_document": "retrieval_document",
    "task_type_query": "retrieval_query"
}
```

```python
# config/rag_config.py

RAG_SETTINGS = {
    # Chunking
    "chunk_size": 800,
    "chunk_overlap": 100,
    "min_chunk_size": 100,
    
    # Retrieval
    "retrieval_top_k": 5,
    "relevance_threshold": 0.7,
    "rerank": True,
    
    # Hybrid Search
    "semantic_weight": 0.7,
    "keyword_weight": 0.3,
    
    # Context
    "max_context_tokens": 4000,
    "include_sources": True
}

SOCRATIC_CONFIG = {
    "min_mastery_for_advanced": 0.7,
    "max_hints_per_query": 3,
    "encourage_self_discovery": True
}
```

---

## 7. API Routes Example

```python
# api/routes/documents.py
from fastapi import APIRouter, UploadFile, File, Depends
from services.document_processor import DocumentProcessor
from services.embedding_service import EmbeddingService
from services.vector_store import VectorStore

router = APIRouter(prefix="/api/documents", tags=["documents"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    subject_id: str,
    current_user = Depends(get_current_faculty)
):
    """Upload and process curriculum document"""
    
    # Save file temporarily
    file_path = f"/tmp/{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())
    
    # Process document
    processor = DocumentProcessor()
    extracted = processor.extract_text_from_pdf(file_path)
    chunks = processor.chunk_text(extracted["text"], extracted["metadata"])
    
    # Generate embeddings
    embedding_service = EmbeddingService()
    chunk_texts = [chunk["text"] for chunk in chunks]
    embeddings = await embedding_service.generate_embeddings_batch(chunk_texts)
    
    # Store in database
    # First create document record
    doc_record = supabase.table("documents").insert({
        "subject_id": subject_id,
        "filename": file.filename,
        "metadata": extracted["metadata"],
        "uploaded_by": current_user.id
    }).execute()
    
    document_id = doc_record.data[0]["id"]
    
    # Store embeddings
    vector_store = VectorStore(supabase)
    await vector_store.store_embeddings(
        document_id, chunks, embeddings, subject_id
    )
    
    return {
        "document_id": document_id,
        "chunks_processed": len(chunks),
        "status": "success"
    }


# api/routes/chat.py
from fastapi import APIRouter, Depends
from services.rag_service import RAGService
from services.socratic_engine import SocraticEngine

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("/query")
async def chat_query(
    query: str,
    subject_id: str,
    conversation_id: str = None,
    current_user = Depends(get_current_student)
):
    """Process student query with RAG + Socratic method"""
    
    # Get student's mastery score for subject
    mastery = get_student_mastery(current_user.id, subject_id)
    
    # Retrieve context
    rag_service = RAGService(embedding_service, vector_store)
    retrieved_context = await rag_service.retrieve(query, subject_id)
    
    if not retrieved_context:
        return {
            "response": "This topic doesn't appear in our curriculum materials.",
            "sources": []
        }
    
    context_text = rag_service.assemble_context(retrieved_context)
    
    # Generate Socratic response
    socratic_engine = SocraticEngine()
    result = await socratic_engine.generate_socratic_response(
        query, context_text, mastery.score
    )
    
    # Save to conversation history
    save_message(conversation_id, "user", query)
    save_message(conversation_id, "assistant", result["response"])
    
    return {
        "response": result["response"],
        "intent": result["intent"],
        "strategy": result["strategy"],
        "sources": retrieved_context[:3]  # Top 3 sources
    }
```

---

## Environment Variables

```bash
# .env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

---

## Requirements.txt

```txt
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6
PyMuPDF==1.23.8
google-generativeai==0.3.1
supabase==2.0.3
langchain==0.1.0
langgraph==0.0.20
python-dotenv==1.0.0
pydantic==2.5.0
numpy==1.24.3
```

