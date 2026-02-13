"""Quiz API Routes — CRUD, generation, and scoring."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import httpx
import json

from services.quiz_generator import QuizGenerator
from config.settings import SUPABASE_URL, SUPABASE_ANON_KEY

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


def _headers():
    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


# ─── Request / Response Models ───

class QuizCreateRequest(BaseModel):
    topic: str
    subject_id: str
    faculty_id: str
    title: Optional[str] = None
    question_count: Optional[int] = 10


class QuizPublishRequest(BaseModel):
    quiz_id: str


class QuizAttemptRequest(BaseModel):
    quiz_id: str
    student_id: str
    answers: List[dict]  # [{question_index, selected_option}]


class AnswerRequest(BaseModel):
    question: str
    correct_answer: str
    student_answer: str


# ─── Routes ───

@router.post("/create")
async def create_quiz(request: QuizCreateRequest):
    """Faculty creates a quiz: AI generates MCQs from curriculum, saves to DB."""
    if not request.topic.strip():
        raise HTTPException(status_code=400, detail="Topic is required")

    try:
        generator = QuizGenerator()
        quiz_data = generator.generate_quiz(
            topic=request.topic,
            subject_id=request.subject_id,
            mastery_score=0.5,
            question_count=request.question_count or 10,
        )

        if "error" in quiz_data and not quiz_data.get("questions"):
            raise HTTPException(status_code=422, detail=quiz_data["error"])

        title = request.title or f"Quiz: {request.topic}"

        # Save to Supabase
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{SUPABASE_URL}/rest/v1/quizzes",
                headers=_headers(),
                json={
                    "subject_id": request.subject_id,
                    "faculty_id": request.faculty_id,
                    "title": title,
                    "topic": request.topic,
                    "questions": json.dumps(quiz_data.get("questions", [])),
                    "is_published": False,
                },
            )
            resp.raise_for_status()
            saved = resp.json()

        return {
            "quiz": saved[0] if saved else None,
            "questions": quiz_data.get("questions", []),
            "difficulty": quiz_data.get("difficulty", "intermediate"),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quiz creation failed: {str(e)}")


@router.post("/publish")
async def publish_quiz(request: QuizPublishRequest):
    """Mark a quiz as published so students can see it."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.patch(
                f"{SUPABASE_URL}/rest/v1/quizzes?id=eq.{request.quiz_id}",
                headers=_headers(),
                json={"is_published": True},
            )
            resp.raise_for_status()
            return {"success": True, "message": "Quiz published to students"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list/{subject_id}")
async def list_quizzes(subject_id: str, published_only: bool = False):
    """List quizzes for a subject. Faculty sees all, students see published only."""
    try:
        url = f"{SUPABASE_URL}/rest/v1/quizzes?subject_id=eq.{subject_id}&order=created_at.desc"
        if published_only:
            url += "&is_published=eq.true"

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, headers=_headers())
            resp.raise_for_status()
            quizzes = resp.json()

        # Parse questions JSON string back to list
        for q in quizzes:
            if isinstance(q.get("questions"), str):
                q["questions"] = json.loads(q["questions"])

        return {"quizzes": quizzes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/attempt")
async def submit_attempt(request: QuizAttemptRequest):
    """Student submits quiz answers. Scores and saves the attempt."""
    try:
        # Fetch the quiz
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{SUPABASE_URL}/rest/v1/quizzes?id=eq.{request.quiz_id}&select=*",
                headers=_headers(),
            )
            resp.raise_for_status()
            quiz_list = resp.json()

        if not quiz_list:
            raise HTTPException(status_code=404, detail="Quiz not found")

        quiz = quiz_list[0]
        questions = quiz["questions"]
        if isinstance(questions, str):
            questions = json.loads(questions)

        # Score the answers
        correct_count = 0
        feedback = []
        for ans in request.answers:
            idx = ans.get("question_index", 0)
            selected = ans.get("selected_option", "")
            if idx < len(questions):
                q = questions[idx]
                correct = q.get("correct_answer", "")
                is_correct = selected.strip().lower() == correct.strip().lower()
                if is_correct:
                    correct_count += 1
                feedback.append({
                    "question_index": idx,
                    "selected": selected,
                    "correct_answer": correct,
                    "is_correct": is_correct,
                    "question": q.get("question", ""),
                })

        total = len(questions)
        score = round((correct_count / total) * 100) if total > 0 else 0

        # Save attempt
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{SUPABASE_URL}/rest/v1/quiz_attempts",
                headers=_headers(),
                json={
                    "quiz_id": request.quiz_id,
                    "student_id": request.student_id,
                    "answers": json.dumps(request.answers),
                    "score": score,
                    "correct_count": correct_count,
                    "total_questions": total,
                    "feedback": json.dumps(feedback),
                },
            )
            resp.raise_for_status()

        grade = "A" if score >= 90 else "B" if score >= 75 else "C" if score >= 60 else "D" if score >= 40 else "F"

        return {
            "score": score,
            "correct": correct_count,
            "total": total,
            "grade": grade,
            "feedback": feedback,
            "message": f"You scored {score}% ({correct_count}/{total}). "
                       f"{'Great job!' if score >= 75 else 'Keep practicing!' if score >= 40 else 'Review this topic.'}",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quiz attempt failed: {str(e)}")


@router.get("/history/{student_id}")
async def quiz_history(student_id: str, subject_id: Optional[str] = None):
    """Get a student's quiz attempt history."""
    try:
        url = (
            f"{SUPABASE_URL}/rest/v1/quiz_attempts"
            f"?student_id=eq.{student_id}"
            f"&select=*,quizzes(title,topic,subject_id)"
            f"&order=completed_at.desc"
        )
        if subject_id:
            # PostgREST nested filter
            url += f"&quizzes.subject_id=eq.{subject_id}"

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(url, headers=_headers())
            resp.raise_for_status()
            attempts = resp.json()

        # Filter out attempts where the quiz subject doesn't match
        if subject_id:
            attempts = [
                a for a in attempts
                if a.get("quizzes") and a["quizzes"].get("subject_id") == subject_id
            ]

        return {"attempts": attempts}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/results/{quiz_id}")
async def quiz_results(quiz_id: str):
    """Faculty: get all student attempts for a specific quiz."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{SUPABASE_URL}/rest/v1/quiz_attempts"
                f"?quiz_id=eq.{quiz_id}"
                f"&select=*,students(student_id)"
                f"&order=completed_at.desc",
                headers=_headers(),
            )
            resp.raise_for_status()
            return {"results": resp.json()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/evaluate")
async def evaluate_answer(request: AnswerRequest):
    """Evaluate a student's quiz answer and provide feedback."""
    try:
        generator = QuizGenerator()
        result = generator.evaluate_answer(
            question=request.question,
            correct_answer=request.correct_answer,
            student_answer=request.student_answer,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
