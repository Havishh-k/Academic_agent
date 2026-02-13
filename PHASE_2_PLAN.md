# Phase 2: Intelligence Layer - Complete Implementation Plan

## Overview
Phase 2 transforms your infrastructure into an intelligent, governed learning system. This phase focuses on:
1. RAG Pipeline & Knowledge Vault
2. Socratic Logic Engine
3. Dynamic Documentation with PlantUML

---

## 🎯 Phase 2 Goals

### Primary Objectives:
- ✅ Implement governed RAG pipeline with curriculum boundaries
- ✅ Build Socratic reasoning engine that guides, not answers
- ✅ Create adaptive quiz generation system
- ✅ Set up document ingestion & embedding pipeline
- ✅ Integrate PlantUML for live architecture documentation

### Success Metrics:
- RAG retrieval accuracy > 85%
- Average response time < 3s
- Socratic guidance score > 90% (evaluated by faculty)
- Quiz generation time < 5s
- Document ingestion: 100 pages/minute

---

## 📋 Module Breakdown

### Module 2.1: RAG Pipeline & Knowledge Vault Ingestion

**Duration:** 2-3 weeks

#### Architecture Components:

```
Document Upload → Text Extraction → Chunking → Embedding → Vector Storage
                                                                ↓
Student Query → Query Embedding → Similarity Search → Context Assembly → LLM
```

#### Implementation Steps:

**Step 1: Document Ingestion Service** (3 days)
- **Objective:** Process PDF uploads and extract clean text
- **Tech Stack:** PyMuPDF (fitz), FastAPI
- **Deliverables:**
  * PDF text extraction endpoint
  * Text cleaning & preprocessing
  * Metadata extraction (subject, topic, difficulty)

**Step 2: Chunking Strategy** (2 days)
- **Objective:** Split documents into semantically meaningful chunks
- **Strategy:** 
  * Semantic chunking (preserve paragraph/section boundaries)
  * Chunk size: 500-1000 tokens with 100-token overlap
  * Preserve hierarchical structure (chapter → section → paragraph)
- **Deliverables:**
  * Chunking algorithm implementation
  * Metadata preservation in chunks

**Step 3: Embedding Generation** (2 days)
- **Objective:** Convert text chunks to vector embeddings
- **Model:** Google Gemini Embedding API
- **Deliverables:**
  * Batch embedding generation (optimize API calls)
  * Error handling & retry logic
  * Progress tracking for large documents

**Step 4: Vector Storage** (3 days)
- **Objective:** Store embeddings with metadata in Supabase
- **Schema Design:**
  ```sql
  CREATE TABLE embeddings (
    id UUID PRIMARY KEY,
    document_id UUID REFERENCES documents(id),
    chunk_text TEXT,
    chunk_index INTEGER,
    embedding VECTOR(768), -- Gemini embedding size
    metadata JSONB,
    subject_id UUID REFERENCES subjects(id),
    created_at TIMESTAMP
  );
  
  CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops);
  ```
- **Deliverables:**
  * Database schema
  * Efficient similarity search queries
  * Metadata filtering capabilities

**Step 5: Retrieval System** (4 days)
- **Objective:** Implement hybrid search (semantic + keyword)
- **Features:**
  * Cosine similarity search
  * Re-ranking based on metadata
  * Subject-based filtering (governance)
  * Relevance threshold filtering
- **Deliverables:**
  * Retrieval API endpoint
  * Context assembly logic
  * Relevance scoring algorithm

---

### Module 2.2: Socratic Logic Implementation

**Duration:** 2 weeks

#### Core Philosophy:
The Socratic Engine **guides discovery** rather than providing direct answers. It:
- Asks clarifying questions
- Breaks complex problems into steps
- Provides hints, not solutions
- Validates student understanding

#### Architecture:

```
Student Query → Intent Analysis → Response Strategy Selection → Socratic Response
                                           ↓
                                    [Direct, Guided, Probe, Hint]
```

#### Implementation Steps:

**Step 1: Intent Classification** (3 days)
- **Objective:** Understand what the student is asking
- **Categories:**
  * Conceptual understanding ("What is...?")
  * Problem-solving ("How do I solve...?")
  * Clarification ("Why does...?")
  * Verification ("Is this correct?")
- **Implementation:**
  ```python
  def classify_intent(query: str) -> Intent:
      # Use Gemini with structured output
      prompt = f"""
      Classify this student query into one of these intents:
      - conceptual_understanding
      - problem_solving
      - clarification
      - verification
      
      Query: {query}
      
      Return JSON: {{"intent": "<type>", "confidence": 0.0-1.0}}
      """
      # Parse response and return Intent object
  ```
- **Deliverables:**
  * Intent classification function
  * Confidence thresholding
  * Fallback handling

**Step 2: Response Strategy Engine** (4 days)
- **Objective:** Select appropriate Socratic response based on context
- **Strategies:**
  
  **1. Guided Discovery** (For conceptual questions)
  ```
  Student: "What is a binary tree?"
  Agent: "Good question! Let's think about this step by step.
          1. What does 'binary' mean in general?
          2. Can you think of how that might apply to a data structure?
          I'll help you connect these ideas."
  ```
  
  **2. Problem Decomposition** (For problem-solving)
  ```
  Student: "How do I implement quicksort?"
  Agent: "Let's break this down:
          - What's the first step in quicksort? (Hint: choosing something)
          - Once you have that, what happens to the array?
          - What pattern do you see emerging here?"
  ```
  
  **3. Probing Questions** (For verification)
  ```
  Student: "Is my solution correct? [code]"
  Agent: "Let me guide you to verify:
          - What's the time complexity you achieved?
          - What happens if the input is [edge case]?
          - Can you trace through your code with this example?"
  ```
  
  **4. Contextual Hints** (When student is stuck)
  ```
  Student: "I'm stuck on this recursion problem"
  Agent: "Let's think about recursion principles:
          Hint 1: What's the simplest case? (Base case)
          Hint 2: If you solve the smaller problem, how do you build up?
          Try applying this to your problem."
  ```

- **Implementation:**
  ```python
  class SocraticEngine:
      def __init__(self, llm, knowledge_base):
          self.llm = llm
          self.kb = knowledge_base
          
      def generate_response(self, query, context, student_mastery):
          intent = self.classify_intent(query)
          strategy = self.select_strategy(intent, student_mastery)
          
          # Build Socratic prompt
          system_prompt = self.build_socratic_prompt(strategy)
          
          # Retrieve relevant context
          retrieved_context = self.kb.retrieve(query)
          
          # Generate response
          response = self.llm.generate(
              system=system_prompt,
              context=retrieved_context,
              query=query,
              temperature=0.7  # Slightly creative for varied questioning
          )
          
          return self.format_socratic_response(response)
      
      def build_socratic_prompt(self, strategy):
          return f"""
          You are a Socratic tutor following the {strategy} approach.
          
          RULES:
          1. NEVER give direct answers
          2. Ask guiding questions
          3. Break complex topics into digestible steps
          4. Validate understanding at each step
          5. Only use information from the provided context
          6. If information isn't in context, say "This topic isn't covered in our curriculum materials"
          
          RESPONSE STRUCTURE:
          1. Acknowledge the question
          2. Ask 2-3 guiding questions
          3. Provide a hint if needed
          4. Encourage next step
          
          Remember: Guide them to discover, don't tell them the answer.
          """
  ```

- **Deliverables:**
  * Socratic prompt templates
  * Strategy selection logic
  * Response formatting

**Step 3: Conversation State Management** (3 days)
- **Objective:** Track conversation context and progress
- **Use LangChain/LangGraph:**
  ```python
  from langgraph.graph import StateGraph, END
  
  class ConversationState(TypedDict):
      messages: List[Message]
      current_topic: str
      student_understanding: float  # 0-1 score
      hints_given: int
      conversation_id: str
  
  def build_conversation_graph():
      workflow = StateGraph(ConversationState)
      
      workflow.add_node("classify_intent", classify_intent_node)
      workflow.add_node("retrieve_context", retrieve_context_node)
      workflow.add_node("generate_socratic", generate_socratic_node)
      workflow.add_node("assess_understanding", assess_understanding_node)
      
      workflow.set_entry_point("classify_intent")
      
      workflow.add_edge("classify_intent", "retrieve_context")
      workflow.add_edge("retrieve_context", "generate_socratic")
      workflow.add_edge("generate_socratic", "assess_understanding")
      
      # Conditional: if understanding is low, provide more guidance
      workflow.add_conditional_edges(
          "assess_understanding",
          should_continue_guidance,
          {
              "continue": "generate_socratic",
              "end": END
          }
      )
      
      return workflow.compile()
  ```

- **Deliverables:**
  * LangGraph conversation flow
  * State persistence in Supabase
  * Context window management

**Step 4: Curriculum Boundary Enforcement** (2 days)
- **Objective:** Ensure AI only uses approved materials
- **Implementation:**
  ```python
  def enforce_curriculum_boundaries(query, retrieved_docs, subject_id):
      # Check if retrieved documents belong to the subject
      valid_docs = [
          doc for doc in retrieved_docs 
          if doc.subject_id == subject_id
      ]
      
      if not valid_docs:
          return {
              "response": "I can only help with topics covered in your current curriculum. This question seems outside our materials.",
              "flag_for_review": True
          }
      
      # Check relevance threshold
      if max(doc.relevance_score for doc in valid_docs) < 0.7:
          return {
              "response": "I'm not finding clear information about this in our curriculum. Could you rephrase or ask about a related topic?",
              "flag_for_review": True
          }
      
      return {"docs": valid_docs, "allowed": True}
  ```

- **Deliverables:**
  * Boundary checking logic
  * Out-of-scope response templates
  * Flagging system for review

---

### Module 2.3: Adaptive Quiz Generation

**Duration:** 1.5 weeks

#### Architecture:

```
Conversation Context → Topic Extraction → Difficulty Assessment → 
  Quiz Generation → Question Validation → Storage
```

#### Implementation Steps:

**Step 1: Contextual Topic Extraction** (2 days)
- **Objective:** Identify quiz-worthy topics from conversation
- **Implementation:**
  ```python
  def extract_quiz_topics(conversation_history):
      # Use LLM to identify key concepts discussed
      prompt = f"""
      Analyze this conversation and extract testable concepts:
      
      Conversation:
      {conversation_history}
      
      Return JSON:
      {{
        "topics": [
          {{"concept": "...", "importance": 0-1, "coverage": "brief/detailed"}}
        ]
      }}
      """
      
      topics = llm.generate_structured(prompt)
      return [t for t in topics if t.importance > 0.6]
  ```

**Step 2: Difficulty Calibration** (3 days)
- **Objective:** Generate questions matching student mastery level
- **Adaptive Algorithm:**
  ```python
  def calculate_difficulty(student_mastery_score, topic):
      base_difficulty = topic.base_difficulty  # from curriculum metadata
      
      if mastery_score < 0.3:
          difficulty = "beginner"
      elif mastery_score < 0.7:
          difficulty = "intermediate"
      else:
          difficulty = "advanced"
      
      # Introduce some challenge (zone of proximal development)
      if mastery_score > 0.5 and random.random() < 0.3:
          difficulty = next_level(difficulty)
      
      return difficulty
  ```

**Step 3: Question Generation** (4 days)
- **Objective:** Generate diverse, curriculum-aligned questions
- **Question Types:**
  * Multiple Choice (MCQ)
  * True/False
  * Fill in the Blank
  * Short Answer
  * Code Completion (for CS subjects)

- **Generation Logic:**
  ```python
  def generate_quiz(topic, difficulty, question_count=5):
      curriculum_context = retrieve_context(topic)
      
      prompt = f"""
      Generate {question_count} quiz questions on: {topic}
      Difficulty: {difficulty}
      
      Context from curriculum:
      {curriculum_context}
      
      Requirements:
      1. Questions must be answerable from the provided context ONLY
      2. Mix question types: MCQ, True/False, Short Answer
      3. Include distractors that test common misconceptions
      4. Provide detailed explanations for correct answers
      
      Return JSON:
      {{
        "questions": [
          {{
            "type": "mcq",
            "question": "...",
            "options": ["A", "B", "C", "D"],
            "correct_answer": "B",
            "explanation": "...",
            "difficulty": "{difficulty}"
          }}
        ]
      }}
      """
      
      return llm.generate_structured(prompt)
  ```

**Step 4: Question Validation** (2 days)
- **Objective:** Ensure quality and curriculum alignment
- **Validation Checks:**
  ```python
  def validate_question(question, curriculum_context):
      checks = {
          "answerable": is_answerable_from_context(question, curriculum_context),
          "unambiguous": has_clear_correct_answer(question),
          "difficulty_appropriate": matches_target_difficulty(question),
          "no_bias": check_for_bias(question)
      }
      
      return all(checks.values()), checks
  ```

**Step 5: Feedback & Explanation System** (2 days)
- **Objective:** Provide meaningful feedback on answers
- **Implementation:**
  ```python
  def generate_feedback(question, student_answer, correct_answer):
      if student_answer == correct_answer:
          return {
              "correct": True,
              "feedback": "Correct! " + question.explanation,
              "mastery_delta": +0.1
          }
      else:
          # Analyze misconception
          misconception = identify_misconception(
              question, 
              student_answer, 
              correct_answer
          )
          
          return {
              "correct": False,
              "feedback": f"Not quite. {misconception.explanation}. Let's review: {question.explanation}",
              "mastery_delta": -0.05,
              "suggested_review": misconception.related_topics
          }
  ```

---

### Module 2.4: PlantUML Integration

**Duration:** 3-4 days

#### Purpose:
Auto-generate architecture diagrams for documentation and presentations.

#### Implementation:

**Step 1: Setup PlantUML Service** (1 day)
```python
# services/plantuml_service.py
import requests
import zlib
import base64

class PlantUMLService:
    def __init__(self):
        self.server = "http://www.plantuml.com/plantuml/png/"
    
    def encode(self, plantuml_text):
        """Encode PlantUML text for URL"""
        compressed = zlib.compress(plantuml_text.encode('utf-8'))
        return base64.b64encode(compressed).decode('ascii')
    
    def generate_diagram(self, diagram_type, **kwargs):
        if diagram_type == "rag_flow":
            return self.generate_rag_flow()
        elif diagram_type == "sequence":
            return self.generate_sequence_diagram(**kwargs)
        # ... more types
    
    def generate_rag_flow(self):
        uml = """
        @startuml
        !define RECTANGLE class
        
        skinparam backgroundColor #FEFEFE
        skinparam componentStyle rectangle
        
        component "Student Query" as query
        component "Query Embedding" as embed
        database "Vector DB\\n(Supabase)" as vectordb
        component "Similarity Search" as search
        component "Context Assembly" as context
        component "Gemini LLM" as llm
        component "Socratic Response" as response
        
        query --> embed
        embed --> search
        search --> vectordb
        vectordb --> search
        search --> context
        context --> llm
        llm --> response
        
        note right of vectordb
          Only approved 
          curriculum documents
        end note
        
        note right of llm
          Governed by
          Socratic prompt
        end note
        
        @enduml
        """
        
        encoded = self.encode(uml)
        return f"{self.server}{encoded}"
```

**Step 2: Database Schema Diagrams** (1 day)
```python
def generate_er_diagram(tables):
    """Generate ER diagram from database schema"""
    uml = "@startuml\n"
    
    for table in tables:
        uml += f"entity {table.name} {{\n"
        for column in table.columns:
            uml += f"  {column.name} : {column.type}\n"
        uml += "}\n\n"
    
    # Add relationships
    for relation in get_foreign_keys():
        uml += f"{relation.from_table} ||--o{{ {relation.to_table}\n"
    
    uml += "@enduml"
    
    return PlantUMLService().encode(uml)
```

**Step 3: API Endpoint** (1 day)
```python
@app.get("/api/diagrams/{diagram_type}")
async def get_diagram(diagram_type: str):
    service = PlantUMLService()
    diagram_url = service.generate_diagram(diagram_type)
    return {"diagram_url": diagram_url}
```

---

## 🗓️ Implementation Schedule

### Week 1-2: RAG Foundation
- **Days 1-3:** Document ingestion service
- **Days 4-5:** Chunking implementation
- **Days 6-7:** Embedding generation
- **Days 8-10:** Vector storage & retrieval

### Week 3-4: Socratic Engine
- **Days 11-13:** Intent classification
- **Days 14-17:** Response strategies
- **Days 18-20:** Conversation state management
- **Days 21-22:** Curriculum boundaries

### Week 5-6: Quiz System
- **Days 23-24:** Topic extraction
- **Days 25-27:** Difficulty calibration
- **Days 28-31:** Question generation
- **Days 32-33:** Validation & feedback

### Week 6: Integration & PlantUML
- **Days 34-36:** PlantUML service
- **Day 37:** End-to-end testing
- **Days 38-40:** Performance optimization

---

## 📊 Testing Strategy

### Unit Tests:
- Document chunking accuracy
- Embedding generation consistency
- Retrieval relevance scoring
- Intent classification accuracy
- Quiz validation logic

### Integration Tests:
- Full RAG pipeline (query → response)
- Socratic conversation flow
- Quiz generation → feedback cycle

### Evaluation Metrics:
- **RAG Quality:**
  * Retrieval precision/recall
  * Answer faithfulness to context
  * Response time

- **Socratic Effectiveness:**
  * Faculty evaluation scores
  * Student engagement metrics
  * Learning outcome improvement

- **Quiz Quality:**
  * Question validity (faculty review)
  * Difficulty appropriateness
  * Student performance correlation

---

## 🔧 Configuration Files

### LangChain Config:
```python
# config/langchain_config.py
from langchain.chat_models import ChatGoogleGenerativeAI
from langchain.embeddings import GoogleGenerativeAIEmbeddings

GEMINI_CONFIG = {
    "model": "gemini-1.5-flash",
    "temperature": 0.7,
    "max_tokens": 2048
}

EMBEDDING_CONFIG = {
    "model": "models/embedding-001",
    "task_type": "retrieval_document"
}
```

### RAG Config:
```python
# config/rag_config.py
RAG_SETTINGS = {
    "chunk_size": 800,
    "chunk_overlap": 100,
    "retrieval_top_k": 5,
    "relevance_threshold": 0.7,
    "rerank": True
}
```

---

## 📦 Deliverables Checklist

- [ ] Document ingestion API endpoint
- [ ] Embedding generation service
- [ ] Vector search implementation
- [ ] Socratic prompt templates
- [ ] Intent classification system
- [ ] Response strategy engine
- [ ] LangGraph conversation flow
- [ ] Quiz generation API
- [ ] Feedback system
- [ ] PlantUML integration
- [ ] Comprehensive test suite
- [ ] Performance benchmarks
- [ ] API documentation

---

## 🚀 Next Steps After Phase 2

Once Phase 2 is complete, you'll have:
1. Intelligent RAG system responding with curriculum-governed answers
2. Socratic engine guiding student discovery
3. Adaptive quiz generation based on conversation
4. Live architecture documentation

**Phase 3 Preview:**
- Streamlit dashboards consuming these APIs
- Voice interaction integration
- Email notification triggers
- Advanced analytics

