"""Feedback service for analyzing resume relevancy to job descriptions."""

import logging
from typing import Dict, Any
from app.services.client import ai_client
from app.services.pointer_service import get_user_resume_data

logger = logging.getLogger(__name__)


async def analyze_resume_relevancy(user_id: str, job_description: str) -> Dict[str, Any]:
    """
    Analyze how well a resume matches a job description.
    
    Args:
        user_id: User ID
        job_description: Target job description
        
    Returns:
        Dictionary with score (0-100), feedback, and improvement suggestions
    """
    try:
        # Get user's complete resume data
        user_data = get_user_resume_data(user_id)
        
        if not user_data or not user_data.get("resume_items"):
            raise Exception("No resume data found for user")
        
        user_info = user_data.get("user", {})
        resume_items = user_data.get("resume_items", [])
        skills = user_data.get("skills", [])
        
        # Build resume summary
        experiences = [item for item in resume_items if item.get("item_type") == "experience"]
        projects = [item for item in resume_items if item.get("item_type") == "project"]
        
        experiences_text = "\n".join([
            f"- {item.get('title')} at {item.get('organization')}: {item.get('description', '')}"
            for item in experiences
        ])
        
        projects_text = "\n".join([
            f"- {item.get('title')}: {item.get('description', '')}"
            for item in projects
        ])
        
        skills_text = ", ".join([skill.get("name", "") for skill in skills])
        
        # Get all existing pointers
        all_pointers = []
        for item in resume_items:
            # Query pointers for this item
            from app.database.supabase import get_supabase_client
            supabase = get_supabase_client()
            pointers_result = supabase.table("resume_item_points").select("content").eq("resume_item_id", item["id"]).execute()
            pointers = [p["content"] for p in pointers_result.data] if pointers_result.data else []
            all_pointers.extend(pointers)
        
        pointers_text = "\n".join([f"• {p}" for p in all_pointers]) if all_pointers else "No bullet points yet"
        
        # AI prompt for analysis
        prompt = f"""Analyze how well this resume matches the job description. Give a score out of 100 and detailed feedback.

JOB DESCRIPTION:
{job_description}

CANDIDATE'S RESUME:

Skills: {skills_text}

Work Experiences:
{experiences_text}

Projects:
{projects_text}

Current Bullet Points:
{pointers_text}

YOUR TASK:
1. Give a relevancy score (0-100) based on:
   - Skills match (40 points)
   - Experience relevance (30 points)
   - Bullet point quality (20 points)
   - Overall presentation (10 points)

2. Provide specific feedback on:
   - What's strong (relevant skills, good experience matches)
   - What's missing (skills/experience the job needs)
   - Bullet point quality (are they specific? do they have metrics?)

3. Give 2-3 actionable improvement suggestions

Return ONLY valid JSON:
{{
  "score": 75,
  "category_scores": {{
    "skills_match": 35,
    "experience_relevance": 25,
    "bullet_quality": 15,
    "presentation": 10
  }},
  "strengths": [
    "Strong Python and FastAPI experience matches job requirements",
    "Good metrics in some bullet points"
  ],
  "weaknesses": [
    "Missing AWS experience mentioned in job description",
    "Some bullet points lack specific metrics"
  ],
  "suggestions": [
    "Add AWS cloud experience to skills and highlight in projects",
    "Add metrics to all bullet points (users served, time saved, etc.)",
    "Focus more on backend/API development experience"
  ]
}}"""
        
        # Create AI agent for analysis
        agent = ai_client.create_agent(
            name="resume-analyzer",
            model="gpt-4",
            tools=[],
            temperature=0.3  # Low temp for consistent scoring
        )
        
        result = await ai_client.run_agent(agent, prompt)
        output = str(result.final_output) if result.final_output else '{}'
        
        logger.info(f"Resume analysis result: {output[:200]}...")
        
        # Parse JSON response
        import json
        import re
        
        json_match = re.search(r'\{.*\}', output, re.DOTALL)
        if json_match:
            analysis = json.loads(json_match.group())
            return analysis
        else:
            logger.error("Failed to parse analysis JSON")
            return {
                "score": 0,
                "category_scores": {
                    "skills_match": 0,
                    "experience_relevance": 0,
                    "bullet_quality": 0,
                    "presentation": 0
                },
                "strengths": [],
                "weaknesses": ["Failed to analyze resume"],
                "suggestions": ["Please try again"]
            }
        
    except Exception as e:
        logger.error(f"Error analyzing resume relevancy: {e}")
        raise Exception(f"Failed to analyze resume: {str(e)}")

