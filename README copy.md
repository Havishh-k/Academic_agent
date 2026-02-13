This is the complete, updated documentation for your **AI Academic Agent**. It combines the refined PRD/TRD, the multimodal accessibility features, and the new Socratic Quiz Engine into a single, professional **README.md** format that you can use for your project repository.

---

# 🎓 AI Academic Agent: Institutional Socratic Mentor

## 📜 Project Overview

A mission-critical, institutional-grade AI system designed to replace generic search with a **Governed Socratic Engine**. This platform is locked to university-approved curriculum (Data Science & IT) and uses **Adaptive Learning** to guide students through their 2nd-year syllabus.

---

## 🏗️ Technical Stack (The "Machinery")

| **Category** | **Technology & Libraries** | **Purpose** |
| --- | --- | --- |
| **Backend** | **FastAPI (Python)** | High-performance async API for handling concurrent academic queries. |
| **Database** | **Supabase (PostgreSQL)** | Central hub for user profiles, institutional subjects, and mastery logs. |
| **Vector Engine** | **pgvector** | Stores "embeddings" of university notes for fast, contextual document retrieval. |
| **AI Orchestration** | **LangChain / LangGraph** | Manages the Socratic reasoning loops and the RAG pipeline. |
| **Models** | **Gemini 1.5 Flash** | Core LLM for reasoning, quizzes, and accessibility summaries. |
| **Accessibility** | **Web Speech API** | Enables **Speech-to-Text** (STT) and **Text-to-Speech** (TTS) for inclusive learning. |
| **Parsing** | **PyMuPDF (fitz)** | High-fidelity extraction of text and math from student PDF notes. |

---

## 🛠️ Key Features & Working

### 1. The Governed RAG Pipeline

* **Institutional Grounding**: The AI *only* answers based on faculty-approved PDFs uploaded to the **Knowledge Vault**.
* **Socratic Guardrails**: A custom algorithm checks student queries. If an assignment answer is requested, the AI pivots to ask a guiding question instead.

### 2. The Socratic Quiz Engine

* **Contextual Questions**: Generates quizzes based on the specific notes a student just read (e.g., **Machine Learning** or **Core Java**).
* **Adaptive Difficulty**: Quiz complexity adjusts automatically based on the student's current **Mastery Score**.
* **Instant Mastery Sync**: Results update the database (`JSONB` field) to reflect in real-time on the teacher's dashboard.

### 3. Inclusive & Multimodal Design

* **Assistive Learning**: Built-in support for students with disabilities, including voice-controlled navigation and screen-reader compatibility.
* **Visual Summaries**: Auto-generates flowcharts (e.g., for **Data Warehousing schemas**) to help visual and neurodivergent learners.

---

## 🏛️ The Three Portals

### **Portal 1: Student (The Learner)**

* **Socratic Companion**: Guides students through subjects like **Testing of Hypothesis** without giving direct answers.
* **Mastery Dashboard**: A color-coded view of conceptual progress (Green = Mastered, Red = Gap Found).

### **Portal 2: Teacher (The Switchboard)**

* **Class Heatmap**: Visualizes stream-wide performance (DS vs. IT) to identify topics that need re-teaching.
* **Live Update Center**: Drag-and-drop interface to upload new lecture notes or assignment banks.

### **Portal 3: Admin/HOD (The Governance)**

* **Integrity Audit**: Monitors flagged chats where students attempted to bypass the Socratic rules.
* **Domain Lockdown**: Ensures only verified `@youruniversity.edu` users can access the system.

---

## 🛤️ Implementation Roadmap

* **Phase 1**: Database schema initialization & Domain lockdown.
* **Phase 2**: Knowledge Vault setup (RAG) & Socratic Guardrails.
* **Phase 3**: Multimodal accessibility features (Speech-to-Text) & Quiz Engine.
* **Phase 4**: Dashboard UI integration & Final Demo.

---

