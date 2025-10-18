"""Root API routes."""

from fastapi import APIRouter

router = APIRouter(tags=["root"])


@router.get("/")
async def read_root():
    """Root endpoint."""
    return {"message": "Hello from backend-python (FastAPI)!"}
