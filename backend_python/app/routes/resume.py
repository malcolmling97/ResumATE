"""Resume optimization API routes."""

import logging
from fastapi import APIRouter, HTTPException
from app.models import (
    GeneratePointerChunksRequest,
    GeneratePointerChunksResponse,
    GenerateFullResumeRequest,
    GenerateFullResumeResponse,
    ContactInfo,
    Experience,
    Project,
    Education,
    ResumeItemContext
)
from app.services.pointer_service import (
    generate_pointer_chunks_with_context,
    get_user_resume_data,
    get_resume_item_with_pointers,
    generate_full_resume_with_single_call
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["resume"])


@router.post("/generate-pointer-chunks", response_model=GeneratePointerChunksResponse)
async def generate_pointer_chunks(request: GeneratePointerChunksRequest):
    """
    Generate multiple bullet points for a resume item using database context.
    
    This endpoint generates 3 distinct bullet points that can be selected from
    by the frontend. The pointers are saved to the database for future reference.
    
    Returns verbose JSON with resume item context, generated pointers, and counts.
    """
    try:
        logger.info(f"Generating pointer chunks for resume item: {request.resume_item_id}")
        
        # Get resume item details BEFORE generating
        resume_item = get_resume_item_with_pointers(request.resume_item_id)
        if not resume_item:
            raise HTTPException(status_code=404, detail="Resume item not found")
        
        existing_count = len(resume_item.get("existing_pointers", []))
        
        # Generate 3 pointers using database context
        pointers = await generate_pointer_chunks_with_context(
            resume_item_id=request.resume_item_id,
            user_id=request.user_id,
            job_description=request.job_description,
            count=3
        )
        
        # NOTE: Not saving to database - just returning for frontend to choose
        # Frontend will save selected pointers separately
        
        # Create verbose response
        # Note: total_pointers_count = existing because we're NOT saving these to DB
        return GeneratePointerChunksResponse(
            resume_item=ResumeItemContext(
                id=resume_item["id"],
                title=resume_item.get("title", ""),
                organization=resume_item.get("organization"),
                item_type=resume_item.get("item_type", ""),
                description=resume_item.get("description"),
                location=resume_item.get("location"),
                employment_type=resume_item.get("employment_type"),
                start_date=resume_item.get("start_date"),
                end_date=resume_item.get("end_date"),
                is_current=resume_item.get("is_current", False)
            ),
            generated_pointers=pointers,
            existing_pointers_count=existing_count,
            total_pointers_count=existing_count  # Same as existing since not saving
        )
        
    except Exception as e:
        logger.error(f"Error in generate_pointer_chunks: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate pointer chunks: {str(e)}")


@router.post("/generate-full-resume", response_model=GenerateFullResumeResponse)
async def generate_full_resume(request: GenerateFullResumeRequest):
    """
    Full resume optimization with AI-powered skill selection (SINGLE AI CALL).
    
    POST /api/resume/optimize
    
    AI analyzes all data and generates a complete optimized resume:
    - Selects 6-8 most relevant skills matching the job
    - Selects top 3 most relevant experiences OR projects
    - Generates 4 tailored bullets per experience
    - Generates 3 tailored bullets per project
    
    Returns frontend-ready JSON matching the expected structure.
    Speed: ~5-10 seconds (1 AI call)
    """
    try:
        logger.info("Starting full resume optimization with SINGLE AI call")
        
        # Get user's complete resume data from database
        user_data = get_user_resume_data(request.user_id)
        
        if not user_data or not user_data.get("resume_items"):
            raise HTTPException(status_code=404, detail="No resume data found for user")
        
        user_info = user_data.get("user", {})
        
        # Build contact info (static data)
        contact_info = ContactInfo(
            name=user_info.get("name", ""),
            email=user_info.get("email", ""),
            phone=user_info.get("phone")
        )
        
        # Build education list (static data)
        education_list = [
            Education(
                degree=edu.get("title", ""),
                institution=edu.get("description", ""),
                year=edu.get("end_date", "")[:4] if edu.get("end_date") else None
            )
            for edu in user_data.get("education", [])
        ]
        
        # SINGLE AI CALL: Generate complete optimized resume (including skill selection)
        logger.info("Making SINGLE AI call to generate complete resume with skill selection")
        ai_result = await generate_full_resume_with_single_call(
            user_data=user_data,
            job_description=request.job_description
        )
        
        # Parse AI result and format for frontend
        experiences = []
        projects = []
        
        # Use AI-selected skills (NO fallback - empty is better than irrelevant)
        selected_skills = ai_result.get("selected_skills", [])
        if not selected_skills:
            logger.error("AI did not return any skills - this is a problem with the AI response")
            # Return empty rather than all skills - better to show nothing than irrelevant skills
            selected_skills = []
        
        # Map AI-selected experiences to database items for date information
        resume_items_map = {item["id"]: item for item in user_data.get("resume_items", [])}
        
        for exp in ai_result.get("selected_experiences", [])[:2]:  # Limit to 2
            # Try to find matching item in database for dates
            matching_item = None
            for item_id, item in resume_items_map.items():
                if item.get("item_type") == "experience" and item.get("title") == exp.get("title"):
                    matching_item = item
                    break
            
            # Format dates
            start_date = ""
            end_date = ""
            if matching_item:
                start_date = matching_item.get('start_date', '')[:7] if matching_item.get('start_date') else ''
                end_date = matching_item.get('end_date', '')[:7] if matching_item.get('end_date') and not matching_item.get('is_current') else 'Present' if matching_item.get('is_current') else ''
            
            experiences.append(Experience(
                title=exp.get("title", ""),
                company=exp.get("company", ""),
                startDate=start_date,
                endDate=end_date,
                points=exp.get("points", [])[:4]  # Limit to 4 pointers
            ))
        
        for proj in ai_result.get("selected_projects", [])[:2]:  # Limit to 2
            # Try to find matching item in database for dates
            matching_item = None
            for item_id, item in resume_items_map.items():
                if item.get("item_type") == "project" and item.get("title") == proj.get("title"):
                    matching_item = item
                    break
            
            # Format date
            year = None
            if matching_item:
                end_date = matching_item.get('end_date', '')
                start_date = matching_item.get('start_date', '')
                year = end_date[:4] if end_date else start_date[:4] if start_date else None
            
            projects.append(Project(
                title=proj.get("title", ""),
                date=year,
                points=proj.get("points", [])[:3]  # Limit to 3 pointers
            ))
        
        logger.info(f"Generated {len(selected_skills)} skills, {len(experiences)} experiences and {len(projects)} projects with SINGLE AI call")
        
        return GenerateFullResumeResponse(
            contactInfo=contact_info,
            skills=selected_skills,
            experiences=experiences,
            projects=projects,
            education=education_list
        )
        
    except Exception as e:
        logger.error(f"Error in generate_full_resume: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate full resume: {str(e)}")
