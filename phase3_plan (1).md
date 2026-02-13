# 🖥️ Phase 3: Interaction & Interfaces

> **Duration:** 6 Weeks · 3 Sprints (2 weeks each)  
> **Goal:** Deliver everything users touch — Streamlit dashboards, student chat UI with voice, and the email notification pipeline.

---

## 🎯 Phase Objectives

- Ship production-ready Streamlit dashboards for Teacher and Admin portals
- Deploy the student chat interface with Web Speech API (STT + TTS)
- Activate the Supabase Edge Function email notification pipeline
- Establish end-to-end integration between all frontend layers and the FastAPI backend

---

## 📅 Sprint Breakdown

| Sprint | Duration | Key Tasks | Owner | Deliverable |
|--------|----------|-----------|-------|-------------|
| **3.1** | Wk 1–2 | Teacher Dashboard: heatmap component, content manager (PDF upload/remove), student intervention list, Supabase data hooks | Full-stack | Teacher Portal v1 (Streamlit) |
| **3.2** | Wk 3–4 | Admin Dashboard: user management UI (approve/revoke), audit log viewer, system health monitor (API latency / error rates), role-based auth guards | Full-stack | Admin Portal v1 (Streamlit) |
| **3.3** | Wk 5–6 | Student Chat UI: chat layout, voice button (STT), TTS playback toggle, progress view widget. Email Edge Functions: welcome, quiz summary, at-risk alerts. Integration smoke tests. | Frontend + Backend | Student Chat UI + Email Pipeline |

---

## 🧑‍🏫 Sprint 3.1 — Teacher Portal

The Teacher Portal is built in Streamlit and communicates with FastAPI via authenticated REST calls. The frontend never queries the database directly.

| Feature | Implementation Notes |
|---------|----------------------|
| **Performance Heatmap** | Plotly heatmap; axes = Topics × Students; colour = mastery score from `MASTERY_LOGS`. Cached with `st.cache_data(ttl=300)`. |
| **Content Manager** | `st.file_uploader` (PDF only, max 20 MB). On upload: `POST /api/documents` → PyMuPDF extraction → chunking → pgvector upsert. Delete triggers cascade removal of embeddings. |
| **Intervention List** | Students whose mastery score falls below configurable threshold (default 40%). Sortable by subject. One-click email alert via Edge Function. |
| **Auth Guard** | Streamlit-Authenticator + JWT validation against Supabase. Role check: `user.role == 'teacher'`. |

---

## 🛡️ Sprint 3.2 — Admin Portal

| Feature | Implementation Notes |
|---------|----------------------|
| **User Management** | Approve/revoke access table with search + filter. `PATCH /api/admin/users/{id}` updates `is_approved` flag and triggers account email via Edge Function. |
| **Audit Log Viewer** | Paginated table of flagged interactions. Columns: timestamp, student_id, query snippet, flag reason. Exportable as CSV. |
| **System Health Monitor** | Live metrics panel: API p50/p95 latency, error rate (%), uptime. Pulls from `GET /api/admin/health`. Auto-refreshes every 30s with `st.rerun()`. |
| **Domain Lockdown UI** | Admin can add/remove allowed email domains. Stored in Supabase `settings` table; enforced by FastAPI auth middleware. |

---

## 🧑‍🎓 Sprint 3.3 — Student Chat Interface

| Component | Implementation Notes |
|-----------|----------------------|
| **Chat Layout** | `st.chat_message` + `st.chat_input` widgets. Conversation history in `st.session_state.messages`. Each turn sent to `POST /api/chat` with full history for LangGraph state continuity. |
| **Voice Input (STT)** | Web Speech API (`SpeechRecognition`) injected via `st.components.html`. Mic button triggers recording; transcript auto-fills `chat_input`. Fallback: text input only. |
| **Voice Output (TTS)** | Web Speech API (`SpeechSynthesis`). Toggle in sidebar. On assistant message render, JS calls `speechSynthesis.speak()`. Respects system voice setting. |
| **Progress Widget** | Radar/spider chart (Plotly) showing mastery scores per subject. Pulls from `GET /api/students/{id}/mastery`. Displayed in sidebar or dedicated Progress tab. |
| **Quiz Zone** | Quiz initiated by "Start Quiz" button or auto-triggered by Socratic engine. MCQ cards via `st.radio`; submitted to `POST /api/quiz/submit`. Instant feedback displayed inline. |

---

## 📧 Sprint 3.3 — Email Notification Pipeline

All email logic runs in **Supabase Edge Functions (Deno)**, decoupled from the FastAPI core.

| Trigger | Recipient | Logic |
|---------|-----------|-------|
| **User Registration** | New Student/Teacher | Welcome email with login link. Fired by Supabase Auth webhook (`user.created`). |
| **Quiz Completed** | Student | Score summary + topic breakdown. Fired by DB webhook on `INSERT` into `MASTERY_LOGS`. |
| **At-Risk Alert** | Assigned Teacher | Lists flagged students + lowest-scoring topics. Fired by FastAPI daily cron (06:00 UTC). |
| **Account Approved** | Student/Teacher | Confirmation email. Fired by DB webhook on `UPDATE` of `PROFILES.is_approved`. |

---

## 🔌 New API Endpoints (Phase 3)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Main chat endpoint. Accepts `messages[]`, `student_id`. Returns Socratic response + optional quiz trigger. |
| `POST` | `/api/documents` | Upload PDF for RAG ingestion. Multipart form. Returns `document_id`. |
| `DELETE` | `/api/documents/{id}` | Remove document and cascade-delete all embeddings. |
| `GET` | `/api/students/{id}/mastery` | Returns mastery scores per subject for the given student. |
| `GET` | `/api/teacher/heatmap` | Aggregated mastery matrix for all students in teacher's cohort. |
| `GET` | `/api/teacher/interventions` | Students below mastery threshold, sorted by score ascending. |
| `POST` | `/api/quiz/submit` | Accepts `quiz_id`, `answers[]`. Returns score, feedback, updated mastery. |
| `GET` | `/api/admin/audit-logs` | Paginated log of flagged interactions. Admin role required. |
| `GET` | `/api/admin/health` | API latency p50/p95, error rate, uptime. |
| `PATCH` | `/api/admin/users/{id}` | Approve or revoke user access. Updates `is_approved` flag. |

---

## ✅ Phase 3 Exit Criteria

- [ ] Teacher and Admin portals deployed to staging and reviewed by stakeholders
- [ ] Student chat UI voice features tested in Chrome, Edge, and mobile Chrome
- [ ] Email Edge Functions verified with real institutional addresses
- [ ] All new API endpoints documented in OpenAPI (auto-generated by FastAPI)
- [ ] Integration smoke test: full student login → question → quiz flow passes end-to-end
