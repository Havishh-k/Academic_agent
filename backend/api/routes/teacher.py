"""Teacher API Routes — Heatmap, interventions, content management."""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import httpx

from config.settings import SUPABASE_URL, SUPABASE_ANON_KEY

router = APIRouter(prefix="/api/teacher", tags=["teacher"])


def _headers():
    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
    }


@router.get("/heatmap")
async def get_mastery_heatmap(subject_id: Optional[str] = None):
    """
    Aggregated mastery matrix: Students × Concepts.
    Returns normalized 0-100 scores for Plotly heatmap rendering.
    Color coding: Red (<40), Yellow (40-80), Green (>80).
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Get all concepts for the subject(s)
            concepts_params = {
                "select": "id,concept_name,subject_id,difficulty_level,order_index",
                "order": "order_index.asc",
            }
            if subject_id:
                concepts_params["subject_id"] = f"eq.{subject_id}"

            concepts_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/concepts",
                headers=_headers(),
                params=concepts_params,
            )
            concepts_res.raise_for_status()
            concepts = concepts_res.json()

            # Get all students with enrollments
            students_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/students",
                headers=_headers(),
                params={"select": "id,student_id,user_id,department"},
            )
            students_res.raise_for_status()
            students = students_res.json()

            # Get student names from profiles
            if students:
                user_ids = ",".join(f'"{s["user_id"]}"' for s in students if s.get("user_id"))
                profiles_res = await client.get(
                    f"{SUPABASE_URL}/rest/v1/profiles",
                    headers=_headers(),
                    params={
                        "select": "id,full_name",
                        "id": f"in.({user_ids})",
                    },
                )
                profiles_res.raise_for_status()
                profiles = {p["id"]: p["full_name"] for p in profiles_res.json()}
            else:
                profiles = {}

            # Get learning session scores (mock mastery data if none exists)
            sessions_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/learning_sessions",
                headers=_headers(),
                params={
                    "select": "student_id,concept_id,comprehension_score",
                },
            )
            sessions_res.raise_for_status()
            sessions = sessions_res.json()

            # Build mastery matrix
            mastery_map = {}
            for session in sessions:
                key = (session.get("student_id"), session.get("concept_id"))
                score = session.get("comprehension_score", 0) or 0
                # Keep the latest/highest score
                if key not in mastery_map or score > mastery_map[key]:
                    mastery_map[key] = score

            # Assemble the heatmap data
            student_labels = []
            concept_labels = [c["concept_name"] for c in concepts]
            matrix = []

            for student in students:
                name = profiles.get(student.get("user_id"), student.get("student_id", "Unknown"))
                student_labels.append(name)

                row = []
                for concept in concepts:
                    score = mastery_map.get((student["id"], concept["id"]), 0)
                    # Normalize to 0-100 range
                    normalized = min(100, max(0, score))
                    row.append(normalized)
                matrix.append(row)

        return {
            "students": student_labels,
            "concepts": concept_labels,
            "matrix": matrix,
            "subject_id": subject_id,
            "color_scale": {
                "low": {"max": 40, "color": "#EF4444", "label": "At Risk"},
                "medium": {"min": 40, "max": 80, "color": "#F59E0B", "label": "Progressing"},
                "high": {"min": 80, "color": "#10B981", "label": "Mastered"},
            },
        }
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Supabase error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/interventions")
async def get_interventions(
    threshold: int = Query(default=40, ge=0, le=100),
    subject_id: Optional[str] = None,
):
    """
    Students whose average mastery falls below the configurable threshold.
    Default threshold: 40%. Sorted by score ascending (most at-risk first).
    """
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Get learning sessions
            params = {"select": "student_id,concept_id,comprehension_score,subject_id"}
            if subject_id:
                params["subject_id"] = f"eq.{subject_id}"

            sessions_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/learning_sessions",
                headers=_headers(),
                params=params,
            )
            sessions_res.raise_for_status()
            sessions = sessions_res.json()

            # Get student info
            students_res = await client.get(
                f"{SUPABASE_URL}/rest/v1/students",
                headers=_headers(),
                params={"select": "id,student_id,user_id"},
            )
            students_res.raise_for_status()
            students = {s["id"]: s for s in students_res.json()}

            # Get profiles for names
            if students:
                user_ids = ",".join(f'"{s["user_id"]}"' for s in students.values() if s.get("user_id"))
                profiles_res = await client.get(
                    f"{SUPABASE_URL}/rest/v1/profiles",
                    headers=_headers(),
                    params={"select": "id,full_name,email", "id": f"in.({user_ids})"},
                )
                profiles_res.raise_for_status()
                profiles = {p["id"]: p for p in profiles_res.json()}
            else:
                profiles = {}

            # Aggregate mastery per student
            student_scores = {}
            for session in sessions:
                sid = session.get("student_id")
                score = session.get("comprehension_score", 0) or 0
                if sid not in student_scores:
                    student_scores[sid] = {"total": 0, "count": 0, "lowest_topics": []}
                student_scores[sid]["total"] += score
                student_scores[sid]["count"] += 1

            # Find students below threshold
            at_risk = []
            for sid, data in student_scores.items():
                avg = data["total"] / data["count"] if data["count"] > 0 else 0
                if avg < threshold:
                    student = students.get(sid, {})
                    profile = profiles.get(student.get("user_id"), {})
                    at_risk.append({
                        "student_id": student.get("student_id", "Unknown"),
                        "name": profile.get("full_name", "Unknown"),
                        "email": profile.get("email", ""),
                        "average_mastery": round(avg, 1),
                        "sessions_count": data["count"],
                    })

            # Sort by score ascending (most at-risk first)
            at_risk.sort(key=lambda x: x["average_mastery"])

        return {
            "threshold": threshold,
            "at_risk_count": len(at_risk),
            "students": at_risk,
        }
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Supabase error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
