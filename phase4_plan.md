# 🚀 Phase 4: Polish & Deploy

> **Duration:** 4 Weeks · 2 Sprints (2 weeks each)  
> **Goal:** Harden the system with comprehensive testing, UX refinement, automated documentation, and a staged cloud deployment ending in a final presentation.

---

## 🎯 Phase Objectives

- Achieve >90% test coverage across API endpoints and RAG pipeline components
- Resolve all critical/high-severity UX issues from student and teacher pilot testing
- Auto-generate PlantUML diagrams (class, sequence, ER, deployment) via CI pipeline
- Deploy to cloud with zero-downtime rolling updates and monitoring in place
- Deliver a final presentation deck using the generated architecture diagrams

---

## 📅 Sprint Breakdown

| Sprint | Duration | Key Tasks | Owner | Deliverable |
|--------|----------|-----------|-------|-------------|
| **4.1** | Wk 1–2 | End-to-end test suite (pytest + Playwright), RAG accuracy evaluation (RAGAS), load testing (Locust), security audit (OWASP Top 10), PlantUML diagram generation CI step | QA + Backend | Test Reports + Architecture Docs |
| **4.2** | Wk 2–4 | UX fixes from pilot, performance tuning (query caching, embedding batch size), Docker Compose → cloud deploy (Render/Railway), monitoring setup (Sentry + UptimeRobot), final presentation prep | Full Team | Production Deployment + Final Deck |

---

## 🧪 Sprint 4.1 — Testing Strategy

Testing is split into six layers, each with its own toolchain and acceptance criteria.

| Layer | Tool | Scope | Pass Criteria |
|-------|------|-------|---------------|
| **Unit Tests** | pytest + pytest-cov | FastAPI routes, LangGraph nodes, RAG chunking logic, mastery scoring algorithm | Coverage ≥ 90% |
| **Integration Tests** | pytest + httpx (async) | FastAPI ↔ Supabase, RAG pipeline end-to-end, quiz submission + mastery update flow | All critical paths pass |
| **E2E Tests** | Playwright (Python) | Student login → ask question → take quiz; Teacher upload PDF → heatmap refresh; Admin approve user | Zero critical failures |
| **RAG Quality** | RAGAS | Faithfulness, answer relevance, context precision scored against 50-question gold set | Faithfulness ≥ 0.85 |
| **Load Testing** | Locust | 100 concurrent student chat sessions, 20 concurrent PDF ingestions | p95 latency < 3s, 0% error rate |
| **Security Audit** | OWASP ZAP + manual review | Auth bypass, prompt injection, SQL injection, SSRF, insecure direct object references | 0 Critical / High CVEs |

---

## 📐 Sprint 4.1 — PlantUML Documentation Generation

All diagrams are auto-generated from source code and schema as part of the CI pipeline, keeping docs in sync with code.

| Diagram Type | Source | Output Use |
|--------------|--------|------------|
| **Class Diagram** | Python AST parser scans FastAPI models and LangGraph node classes | Developer onboarding docs, code review reference |
| **Sequence Diagram** | Manual PlantUML DSL authored per key flow (RAG query, quiz submit, email trigger) | Architecture review, stakeholder walkthroughs |
| **ER Diagram** | Supabase schema introspection via `pg_dump \| plantuml-er-gen` script | Database review, DBA reference, final presentation |
| **Deployment Diagram** | Docker Compose YAML parsed by `compose2plantuml` utility | DevOps runbook, incident response reference |

> All generated `.puml` files and rendered `.svg` outputs are committed to `/docs/diagrams` on every CI run.

---

## ☁️ Sprint 4.2 — Deployment Architecture

The system is containerised with Docker and deployed on a PaaS provider. Supabase handles its own managed infrastructure. GitHub Actions automates testing, diagram generation, and deployment on every merge to `main`.

| Service | Platform | Config Notes |
|---------|----------|--------------|
| **FastAPI Backend** | Render (Web Service) | Docker image, auto-deploy on `main` push, 1 GB RAM starter. Env vars from Render dashboard. |
| **Streamlit Portals** | Render (Web Service ×2) | Separate services for Teacher and Admin portals. Shared secrets via Render env groups. |
| **Database + Vectors** | Supabase (Managed) | pgvector extension enabled. Connection pooling via PgBouncer (built-in). |
| **Edge Functions** | Supabase (Managed) | Deno Deploy runtime. Secrets stored in Supabase Vault. Deployed via `supabase CLI`. |
| **CI/CD Pipeline** | GitHub Actions | Test → PlantUML gen → Docker build → Push to GHCR → Render deploy hook. |
| **Error Monitoring** | Sentry (FastAPI SDK) | Automatic exception capture, performance tracing, alert on error rate > 1%. |
| **Uptime Monitoring** | UptimeRobot (free tier) | HTTP checks every 5 min on `/api/health`. Email + SMS alerts on downtime. |

---

## 📊 Sprint 4.2 — Launch Readiness KPIs

| Metric / KPI | Target | How to Measure |
|--------------|--------|----------------|
| Test Coverage (unit + integration) | ≥ 90% | pytest-cov HTML report in CI artifacts |
| RAG Faithfulness Score | ≥ 0.85 | RAGAS eval against gold question set |
| Chat p95 Response Latency | < 3 seconds | Locust load test report |
| Email Delivery Rate | ≥ 99% | Resend / SendGrid delivery dashboard |
| Voice STT Accuracy (English) | ≥ 95% | Manual test with 20-sentence corpus |
| Security Audit | 0 Critical / High CVEs | OWASP ZAP scan report |
| Uptime (post-launch 48h) | ≥ 99.5% | UptimeRobot status page |
| PlantUML Diagrams Generated | 4 diagram types | CI pipeline artifact check |

---

## ⚠️ Risk Register

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| Web Speech API partial support (Safari/Firefox) | Medium | Medium | Feature-detect on load; degrade to text-only. Show Chrome recommendation banner. |
| Gemini API rate limits under concurrent load | Medium | High | Exponential back-off + jitter. Cache frequent queries. Monitor token usage dashboard. |
| PDF ingestion latency for large documents | High | Medium | Queue via FastAPI `BackgroundTasks`; show progress indicator. Tune chunk size from profiling. |
| Prompt injection bypassing governance | Medium | High | System prompt hardening + LLM-based guard classifier before RAG retrieval. Audit all queries. |
| pgvector slow similarity search at scale | Low | High | Add HNSW index on embedding column. Tune `ef_search`. Benchmark at 10k / 100k / 1M vectors. |
| Emails blocked by university spam filters | Medium | Medium | Configure SPF/DKIM/DMARC. Use Resend or SendGrid. Pre-test with institutional IT team. |

---

## 🎤 Final Presentation Structure

> Recommended 20-minute delivery using PlantUML-generated diagrams.

| Slide | Section | Content / Diagram |
|-------|---------|-------------------|
| 1 | Title & Problem Statement | Project name, institutional motivation, key challenges addressed |
| 2 | System Architecture Overview | Deployment diagram (PlantUML) — all services and data flows |
| 3 | Governed RAG Pipeline | Sequence diagram (PlantUML) — query → embed → retrieve → Socratic response |
| 4 | Database Schema | ER diagram (PlantUML) — USERS, PROFILES, MASTERY_LOGS, DOCUMENTS, EMBEDDINGS |
| 5 | Student Portal Demo | Live demo or recording: voice query → Socratic guidance → quiz |
| 6 | Teacher Portal Demo | Live demo: heatmap, content upload, intervention list |
| 7 | Test Results & KPIs | Table of all 8 KPIs with achieved values vs targets |
| 8 | Lessons Learned & Future Work | Key insights, open items, v2.0 roadmap (mobile app, multi-language, LMS integration) |

---

## ✅ Phase 4 Launch Checklist

### Testing & Quality
- [ ] pytest-cov report shows ≥ 90% coverage
- [ ] RAGAS faithfulness score ≥ 0.85 on gold evaluation set
- [ ] Locust load test passed: p95 < 3s at 100 concurrent users
- [ ] OWASP ZAP scan shows 0 Critical / High vulnerabilities
- [ ] Playwright E2E suite passes with zero critical failures

### Documentation
- [ ] All 4 PlantUML diagram types generated and committed to `/docs/diagrams`
- [ ] All API endpoints documented in OpenAPI (auto-generated by FastAPI)
- [ ] Deployment runbook written and reviewed by team

### Deployment
- [ ] Sentry error monitoring active with alert rules configured
- [ ] UptimeRobot checks configured for all production service URLs
- [ ] Domain Lockdown (Auth Policy) verified with non-whitelisted email addresses
- [ ] Production environment smoke test: full student flow end-to-end passes
- [ ] Data retention and privacy policy reviewed with institutional stakeholders

### Presentation
- [ ] Final presentation slides reviewed and rehearsed
- [ ] PlantUML diagrams embedded and rendering correctly in slide deck
- [ ] Live demo environment stable and tested on presentation hardware
