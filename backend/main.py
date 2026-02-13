"""
AI Academic Agent — FastAPI Backend
Phase 3: Interaction & Interfaces
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time

from api.routes import documents, chat, quiz, diagrams
from api.routes import teacher, admin, students

app = FastAPI(
    title="AI Academic Agent API",
    description="Intelligence Layer + Interaction & Interfaces",
    version="3.0.0",
)

# CORS — allow any localhost port in dev (regex), plus explicit origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://localhost:8501",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Middleware: Track API metrics for admin health endpoint ---
@app.middleware("http")
async def track_metrics(request: Request, call_next):
    from api.routes.admin import _api_metrics
    start = time.time()
    try:
        response = await call_next(request)
        _api_metrics["total_requests"] += 1
        latency = time.time() - start
        _api_metrics["latencies"].append(latency)
        # Keep only last 1000 latencies
        if len(_api_metrics["latencies"]) > 1000:
            _api_metrics["latencies"] = _api_metrics["latencies"][-1000:]
        return response
    except Exception as e:
        _api_metrics["total_requests"] += 1
        _api_metrics["total_errors"] += 1
        raise e

# Register Phase 2 routers
app.include_router(documents.router)
app.include_router(chat.router)
app.include_router(quiz.router)
app.include_router(diagrams.router)

# Register Phase 3 routers
app.include_router(teacher.router)
app.include_router(admin.router)
app.include_router(students.router)


@app.get("/")
async def root():
    return {"status": "ok", "service": "AI Academic Agent API", "version": "3.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
