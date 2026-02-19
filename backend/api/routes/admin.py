"""Admin API Routes — User management, audit logs, system health."""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
import httpx
import time

from config.settings import SUPABASE_URL, SUPABASE_ANON_KEY

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Track API metrics in-memory (simple approach)
_api_metrics = {
    "start_time": time.time(),
    "total_requests": 0,
    "total_errors": 0,
    "latencies": [],
}


def _headers():
    return {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


@router.get("/audit-logs")
async def get_audit_logs(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    flagged_only: bool = Query(default=True),
):
    """
    Paginated log of flagged interactions from conversation_logs.
    Includes flag_reason from the Proctor Agent for pattern analysis.
    """
    try:
        offset = (page - 1) * page_size

        async with httpx.AsyncClient(timeout=15.0) as client:
            params = {
                "select": "id,student_id,course_id,message_role,content,was_flagged,flag_reason,created_at",
                "order": "created_at.desc",
                "offset": str(offset),
                "limit": str(page_size),
            }
            if flagged_only:
                params["was_flagged"] = "eq.true"

            # Add Prefer header for count
            headers = _headers()
            headers["Prefer"] = "count=exact"

            res = await client.get(
                f"{SUPABASE_URL}/rest/v1/conversation_logs",
                headers=headers,
                params=params,
            )
            res.raise_for_status()
            logs = res.json()

            # Parse total count from content-range header
            content_range = res.headers.get("content-range", "")
            total = 0
            if "/" in content_range:
                total = int(content_range.split("/")[-1])

        return {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": (total + page_size - 1) // page_size if total else 1,
            "logs": [
                {
                    "id": log.get("id"),
                    "student_id": log.get("student_id", "Unknown"),
                    "message_role": log.get("message_role"),
                    "content_snippet": (log.get("content", "") or "")[:200] + "..." if len(log.get("content", "") or "") > 200 else log.get("content", ""),
                    "flag_reason": log.get("flag_reason", "Not specified"),
                    "was_flagged": log.get("was_flagged", False),
                    "timestamp": log.get("created_at"),
                }
                for log in logs
            ],
        }
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Supabase error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def system_health():
    """
    System health metrics: uptime, request count, error rate.
    Latency p50/p95 from in-memory tracking.
    """
    uptime_seconds = time.time() - _api_metrics["start_time"]
    total = _api_metrics["total_requests"] or 1
    error_rate = (_api_metrics["total_errors"] / total) * 100

    latencies = sorted(_api_metrics["latencies"][-1000:]) if _api_metrics["latencies"] else [0]
    p50 = latencies[len(latencies) // 2] if latencies else 0
    p95 = latencies[int(len(latencies) * 0.95)] if len(latencies) > 1 else p50

    # Check Supabase connectivity
    supabase_status = "healthy"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(
                f"{SUPABASE_URL}/rest/v1/profiles?select=id&limit=1",
                headers=_headers(),
            )
            if res.status_code != 200:
                supabase_status = "degraded"
    except Exception:
        supabase_status = "unhealthy"

    return {
        "status": "healthy" if supabase_status == "healthy" else "degraded",
        "uptime_seconds": round(uptime_seconds),
        "uptime_formatted": f"{int(uptime_seconds // 3600)}h {int((uptime_seconds % 3600) // 60)}m",
        "metrics": {
            "total_requests": _api_metrics["total_requests"],
            "error_rate_percent": round(error_rate, 2),
            "latency_p50_ms": round(p50 * 1000, 1),
            "latency_p95_ms": round(p95 * 1000, 1),
        },
        "services": {
            "fastapi": "healthy",
            "supabase": supabase_status,
            "gemini": "healthy",
        },
    }


class UserUpdateRequest(BaseModel):
    is_approved: Optional[bool] = None
    role: Optional[str] = None


@router.patch("/users/{user_id}")
async def update_user(user_id: str, request: UserUpdateRequest):
    """
    Approve or revoke user access. Updates profile fields.
    """
    try:
        update_data = {}
        if request.is_approved is not None:
            update_data["is_approved"] = request.is_approved
        if request.role is not None:
            if request.role not in ("student", "faculty", "admin"):
                raise HTTPException(status_code=400, detail="Invalid role")
            update_data["role"] = request.role

        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")

        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.patch(
                f"{SUPABASE_URL}/rest/v1/profiles",
                headers=_headers(),
                params={"id": f"eq.{user_id}"},
                json=update_data,
            )
            res.raise_for_status()
            updated = res.json()

        if not updated:
            raise HTTPException(status_code=404, detail="User not found")

        return {
            "status": "updated",
            "user_id": user_id,
            "changes": update_data,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users")
async def list_users(
    role: Optional[str] = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=200),
):
    """List all users with optional role filter."""
    try:
        offset = (page - 1) * page_size
        params = {
            "select": "id,email,full_name,role,created_at",
            "order": "created_at.desc",
            "offset": str(offset),
            "limit": str(page_size),
        }
        if role:
            params["role"] = f"eq.{role}"

        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.get(
                f"{SUPABASE_URL}/rest/v1/profiles",
                headers=_headers(),
                params=params,
            )
            res.raise_for_status()

        return {"users": res.json(), "page": page, "page_size": page_size}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Create User with Password ───────────────────────────────

class CreateUserRequest(BaseModel):
    email: str
    password: str
    full_name: str
    role: str = "student"


@router.post("/create-user")
async def create_user(request: CreateUserRequest):
    """
    Create a new user via Supabase Auth signup API.
    This creates an auth user AND the profile row is auto-created
    by the existing database trigger.
    """
    if request.role not in ("student", "faculty", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role. Must be student, faculty, or admin.")
    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Step 1: Create auth user via Supabase GoTrue signup
            signup_res = await client.post(
                f"{SUPABASE_URL}/auth/v1/signup",
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Content-Type": "application/json",
                },
                json={
                    "email": request.email,
                    "password": request.password,
                    "data": {
                        "full_name": request.full_name,
                        "role": request.role,
                    },
                },
            )

            if signup_res.status_code >= 400:
                error_body = signup_res.json()
                error_msg = error_body.get("msg") or error_body.get("error_description") or error_body.get("message") or "Signup failed"
                raise HTTPException(status_code=signup_res.status_code, detail=error_msg)

            user_data = signup_res.json()
            user_id = user_data.get("id") or (user_data.get("user", {}) or {}).get("id")

            # Step 2: Update the profile row with correct role and name
            # (the trigger may have created it with defaults)
            if user_id:
                await client.patch(
                    f"{SUPABASE_URL}/rest/v1/profiles",
                    headers=_headers(),
                    params={"id": f"eq.{user_id}"},
                    json={
                        "full_name": request.full_name,
                        "role": request.role,
                    },
                )

        return {
            "status": "created",
            "user_id": user_id,
            "email": request.email,
            "role": request.role,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── Reset Password ──────────────────────────────────────────

class ResetPasswordRequest(BaseModel):
    email: str
    redirect_to: str = "http://localhost:5173/login"


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Send a password reset email via Supabase Auth."""
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(
                f"{SUPABASE_URL}/auth/v1/recover",
                headers={
                    "apikey": SUPABASE_ANON_KEY,
                    "Content-Type": "application/json",
                },
                json={
                    "email": request.email,
                    "redirect_to": request.redirect_to,
                },
            )
            if res.status_code >= 400:
                error_body = res.json()
                error_msg = error_body.get("msg") or error_body.get("message") or "Failed to send reset email"
                raise HTTPException(status_code=res.status_code, detail=error_msg)

        return {"status": "sent", "email": request.email}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

