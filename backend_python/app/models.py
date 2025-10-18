"""Pydantic models for API request/response validation."""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class ResumeItemContext(BaseModel):
    """Context information about the resume item."""
    id: str
    title: str
    organization: Optional[str] = None
    item_type: str
    description: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    is_current: bool = False


class GeneratePointerChunksRequest(BaseModel):
    """Request model for generating multiple bullet points for an experience."""
    resume_item_id: str
    user_id: str
    job_description: str


class GeneratePointerChunksResponse(BaseModel):
    """Response model for multiple bullet points generation."""
    resume_item: ResumeItemContext
    generated_pointers: List[str]
    existing_pointers_count: int
    total_pointers_count: int


class PointerWithIndex(BaseModel):
    """A pointer with its index in the list."""
    index: int
    pointer_id: Optional[str] = None  # Database ID if it exists
    content: str


class OptimizedExperience(BaseModel):
    """Hierarchical experience with indexed pointers."""
    experience_id: str
    title: str
    organization: Optional[str] = None
    item_type: str
    relevance_score: int
    selection_reason: str
    pointers: List[PointerWithIndex]  # Hierarchical: index -> pointer


class ContactInfo(BaseModel):
    """Contact information matching frontend structure."""
    name: str
    email: str
    phone: Optional[str] = None


class Experience(BaseModel):
    """Experience matching frontend structure."""
    title: str
    company: str
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    points: List[str]


class Project(BaseModel):
    """Project matching frontend structure."""
    title: str
    date: Optional[str] = None
    points: List[str]


class Education(BaseModel):
    """Education matching frontend structure."""
    degree: str
    institution: str
    year: Optional[str] = None


class GenerateFullResumeRequest(BaseModel):
    """Request model for full resume optimization."""
    user_id: str
    job_description: str


class GenerateFullResumeResponse(BaseModel):
    """Response matching frontend expected structure.
    
    Frontend expects:
    {
        contactInfo: { name, email, phone },
        skills: ["skill1", "skill2", ...],
        experiences: [{ title, company, startDate, endDate, points: [...] }],
        projects: [{ title, date, points: [...] }],
        education: [{ degree, institution, year }]
    }
    """
    contactInfo: ContactInfo
    skills: List[str]
    experiences: List[Experience]
    projects: List[Project]
    education: List[Education]


class CategoryScores(BaseModel):
    """Category scores breakdown."""
    skills_match: int
    experience_relevance: int
    bullet_quality: int
    presentation: int


class AnalyzeResumeRequest(BaseModel):
    """Request model for resume analysis."""
    user_id: str
    job_description: str


class AnalyzeResumeResponse(BaseModel):
    """Response model for resume analysis feedback."""
    score: int
    category_scores: CategoryScores
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
