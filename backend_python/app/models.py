"""Pydantic models for API request/response validation."""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class GenerateOnePointerRequest(BaseModel):
    """Request model for generating a single bullet point."""
    experience_id: str
    experience_context: Dict[str, Any]
    job_description: str


class GenerateOnePointerResponse(BaseModel):
    """Response model for single bullet point generation."""
    pointer: str


class GeneratePointerChunksRequest(BaseModel):
    """Request model for generating multiple bullet points for an experience."""
    experience_id: str
    experience_context: Dict[str, Any]
    job_description: str


class GeneratePointerChunksResponse(BaseModel):
    """Response model for multiple bullet points generation."""
    pointers: List[str]


class OptimizedExperience(BaseModel):
    """Model for optimized experience with AI selection."""
    id: str
    relevance_score: int
    selection_reason: str
    pointers: List[str]


class GenerateFullResumeRequest(BaseModel):
    """Request model for full resume optimization."""
    resume_data: Dict[str, List[Dict[str, Any]]]
    job_description: str


class GenerateFullResumeResponse(BaseModel):
    """Response model for full resume optimization."""
    optimized_summary: List[str]
    optimized_experiences: List[OptimizedExperience]
