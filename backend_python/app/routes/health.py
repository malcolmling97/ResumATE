"""Health check and basic API routes."""

from fastapi import APIRouter, Request

router = APIRouter(prefix="/health", tags=["health"])


@router.get("/health")
async def health_check(request: Request):
    """Basic health check that also validates Supabase config presence."""
    supabase = getattr(request.app.state, "supabase", None)
    return {
        "status": "ok", 
        "supabase_configured": supabase is not None
    }
