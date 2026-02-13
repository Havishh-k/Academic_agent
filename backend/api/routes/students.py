"""Student API Routes — Mastery scores and progress."""
from fastapi import APIRouter, HTTPException
import httpx

from config.settings import SUPABASE_URL, SUPABASE_ANON_KEY

router = APIRouter(prefix="/api/students", tags=["students"])


def _headers():
    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
    }


@router.get("/{student_id}/mastery")
async def get_student_mastery(student_id: str):
    """
    Per-subject mastery scores for a student.
    Returns normalized 0-100 scores for radar chart rendering.
    Also returns weak concepts for adaptive tutor prioritization.
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Get student's learning sessions
            sessions_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/learning_sessions",
                headers=_headers(),
                params={
                    "select": "subject_id,concept_id,comprehension_score,engagement_score,questions_asked",
                    "student_id": f"eq.{student_id}",
                },
            )
            sessions_res.raise_for_status()
            sessions = sessions_res.json()

            # Get subjects for names
            subjects_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/subjects",
                headers=_headers(),
                params={"select": "id,subject_name,subject_code"},
            )
            subjects_res.raise_for_status()
            subjects = {s["id"]: s for s in subjects_res.json()}

            # Get concepts for names
            concepts_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/concepts",
                headers=_headers(),
                params={"select": "id,concept_name,subject_id"},
            )
            concepts_res.raise_for_status()
            concepts = {c["id"]: c for c in concepts_res.json()}

            # Aggregate mastery per subject
            subject_mastery = {}
            concept_scores = {}

            for s in sessions:
                sid = s.get("subject_id")
                cid = s.get("concept_id")
                score = s.get("comprehension_score", 0) or 0

                if sid:
                    if sid not in subject_mastery:
                        subject_mastery[sid] = {"total": 0, "count": 0}
                    subject_mastery[sid]["total"] += score
                    subject_mastery[sid]["count"] += 1

                if cid:
                    if cid not in concept_scores:
                        concept_scores[cid] = {"total": 0, "count": 0}
                    concept_scores[cid]["total"] += score
                    concept_scores[cid]["count"] += 1

            # Build response
            mastery_data = []
            for sid, data in subject_mastery.items():
                avg = min(100, max(0, data["total"] / data["count"])) if data["count"] > 0 else 0
                subj = subjects.get(sid, {})
                mastery_data.append({
                    "subject_id": sid,
                    "subject_name": subj.get("subject_name", "Unknown"),
                    "subject_code": subj.get("subject_code", ""),
                    "mastery_score": round(avg, 1),
                    "sessions_count": data["count"],
                })

            # Find weak concepts (below 40%) for adaptive tutor
            weak_concepts = []
            for cid, data in concept_scores.items():
                avg = data["total"] / data["count"] if data["count"] > 0 else 0
                if avg < 40:
                    concept = concepts.get(cid, {})
                    weak_concepts.append({
                        "concept_id": cid,
                        "concept_name": concept.get("concept_name", "Unknown"),
                        "subject_id": concept.get("subject_id"),
                        "score": round(avg, 1),
                    })

            weak_concepts.sort(key=lambda x: x["score"])

        return {
            "student_id": student_id,
            "subjects": mastery_data,
            "weak_concepts": weak_concepts[:5],
            "overall_mastery": round(
                sum(m["mastery_score"] for m in mastery_data) / len(mastery_data), 1
            ) if mastery_data else 0,
        }
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Supabase error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
