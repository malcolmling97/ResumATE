"""Resume optimization API routes."""

import logging
from fastapi import APIRouter, HTTPException
from app.models import (
    GenerateOnePointerRequest,
    GenerateOnePointerResponse,
    GeneratePointerChunksRequest,
    GeneratePointerChunksResponse,
    GenerateFullResumeRequest,
    GenerateFullResumeResponse,
    OptimizedExperience
)
from app.services.pointer_service import (
    generate_single_pointer,
    generate_pointer_array,
    select_relevant_experiences
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["resume"])


@router.post("/generate-one-pointer", response_model=GenerateOnePointerResponse)
async def generate_one_pointer(request: GenerateOnePointerRequest):
    """
    Generate a single bullet point for an experience.
    
    This endpoint is useful for the rescan feature where users want to regenerate
    a specific bullet point for an experience.
    """
    try:
        logger.info(f"Generating single pointer for experience: {request.experience_id}")
        
        # Generate the pointer using the shared helper function
        pointer = await generate_single_pointer(
            experience=request.experience_context,
            job_description=request.job_description
        )
        
        return GenerateOnePointerResponse(pointer=pointer)
        
    except Exception as e:
        logger.error(f"Error in generate_one_pointer: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate pointer: {str(e)}")


@router.post("/generate-pointer-chunks", response_model=GeneratePointerChunksResponse)
async def generate_pointer_chunks(request: GeneratePointerChunksRequest):
    """
    Generate all 3 bullet points for a single experience.
    
    This endpoint generates multiple distinct bullet points for the same experience,
    calling the helper function 3 times to ensure variety.
    """
    try:
        logger.info(f"Generating pointer chunks for experience: {request.experience_id}")
        
        # Generate 3 pointers using the shared helper function
        pointers = await generate_pointer_array(
            experience=request.experience_context,
            job_description=request.job_description,
            count=3
        )
        
        return GeneratePointerChunksResponse(pointers=pointers)
        
    except Exception as e:
        logger.error(f"Error in generate_pointer_chunks: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate pointer chunks: {str(e)}")


@router.post("/generate-full-resume", response_model=GenerateFullResumeResponse)
async def generate_full_resume(request: GenerateFullResumeRequest):
    """
    Full resume optimization with AI selection.
    
    This endpoint performs a two-step process:
    1. AI selects and ranks the most relevant experiences
    2. Generates optimized bullet points for each selected experience
    """
    try:
        logger.info("Starting full resume optimization")
        
        # Step 1: AI Selection - Select relevant experiences
        logger.info("Step 1: Selecting relevant experiences")
        selected_experiences = await select_relevant_experiences(
            resume_data=request.resume_data,
            job_description=request.job_description
        )
        
        # Step 2: Generate optimized experiences with bullet points
        logger.info("Step 2: Generating optimized experiences")
        optimized_experiences = []
        
        for exp_data in selected_experiences:
            try:
                # Generate 3 pointers for this experience
                pointers = await generate_pointer_array(
                    experience=exp_data['data'],
                    job_description=request.job_description,
                    count=3
                )
                
                # Create optimized experience object
                optimized_exp = OptimizedExperience(
                    id=exp_data['id'],
                    relevance_score=exp_data['relevance_score'],
                    selection_reason=exp_data['selection_reason'],
                    pointers=pointers
                )
                
                optimized_experiences.append(optimized_exp)
                
            except Exception as e:
                logger.error(f"Error generating pointers for experience {exp_data['id']}: {e}")
                # Continue with other experiences even if one fails
                continue
        
        # Step 3: Generate optimized summary (using same logic as pointers for now)
        logger.info("Step 3: Generating optimized summary")
        try:
            # For now, generate summary as 3 keyword-like strings
            # In the future, this could be more sophisticated
            optimized_summary = [
                "Technical Leadership",
                "Scalable Architecture", 
                "Team Collaboration"
            ]
        except Exception as e:
            logger.error(f"Error generating optimized summary: {e}")
            optimized_summary = []
        
        return GenerateFullResumeResponse(
            optimized_summary=optimized_summary,
            optimized_experiences=optimized_experiences
        )
        
    except Exception as e:
        logger.error(f"Error in generate_full_resume: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate full resume: {str(e)}")
