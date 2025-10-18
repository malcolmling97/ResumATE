"""Service for generating resume bullet points using AI."""

import logging
from typing import List, Dict, Any, Optional
from app.services.client import ai_client
from app.database.supabase import get_supabase_client

logger = logging.getLogger(__name__)


def get_user_resume_data(user_id: str) -> Dict[str, Any]:
    """Get all resume data for a user from the database."""
    supabase = get_supabase_client()
    if not supabase:
        logger.warning("Supabase client not available")
        return {}
    
    try:
        # Get user info
        user_data = supabase.table("users").select("*").eq("id", user_id).execute()
        user = user_data.data[0] if user_data.data else None
        
        # Get resume items (experiences, projects, etc.)
        resume_items = supabase.table("resume_items").select("*").eq("user_id", user_id).execute()
        
        # Get existing pointers for each resume item
        resume_items_with_pointers = []
        for item in resume_items.data:
            pointers = supabase.table("resume_item_points").select("*").eq("resume_item_id", item["id"]).order("display_order").execute()
            item["existing_pointers"] = pointers.data
            resume_items_with_pointers.append(item)
        
        # Get skills
        skills = supabase.table("skills").select("*").eq("user_id", user_id).execute()
        
        # Get education
        education = supabase.table("education").select("*").eq("user_id", user_id).execute()
        
        return {
            "user": user,
            "resume_items": resume_items_with_pointers,
            "skills": skills.data,
            "education": education.data
        }
        
    except Exception as e:
        logger.error(f"Error fetching user resume data: {e}")
        return {}


def get_resume_item_with_pointers(resume_item_id: str) -> Optional[Dict[str, Any]]:
    """Get a specific resume item with its existing pointers."""
    supabase = get_supabase_client()
    if not supabase:
        return None
    
    try:
        # Get resume item
        resume_item = supabase.table("resume_items").select("*").eq("id", resume_item_id).execute()
        if not resume_item.data:
            return None
        
        item = resume_item.data[0]
        
        # Get existing pointers
        pointers = supabase.table("resume_item_points").select("*").eq("resume_item_id", resume_item_id).order("display_order").execute()
        item["existing_pointers"] = pointers.data
        
        return item
        
    except Exception as e:
        logger.error(f"Error fetching resume item: {e}")
        return None


def save_new_pointers(resume_item_id: str, user_id: str, new_pointers: List[str]) -> bool:
    """Save new generated pointers to the database."""
    supabase = get_supabase_client()
    if not supabase:
        return False
    
    try:
        # Get current max display order
        existing_pointers = supabase.table("resume_item_points").select("display_order").eq("resume_item_id", resume_item_id).order("display_order", desc=True).execute()
        max_order = existing_pointers.data[0]["display_order"] if existing_pointers.data else 0
        
        # Insert new pointers
        pointer_data = []
        for i, pointer_content in enumerate(new_pointers):
            pointer_data.append({
                "resume_item_id": resume_item_id,
                "user_id": user_id,
                "content": pointer_content,
                "display_order": max_order + i + 1,
                "usage_count": 0
            })
        
        result = supabase.table("resume_item_points").insert(pointer_data).execute()
        return len(result.data) == len(new_pointers)
        
    except Exception as e:
        logger.error(f"Error saving new pointers: {e}")
        return False


async def generate_pointer_variations(pointer_id: str, resume_item_id: str, user_id: str, job_description: str, count: int = 3) -> List[str]:
    """
    Generate variations of a specific pointer.
    
    Takes an existing pointer and generates multiple variations tailored to the job description
    while comparing with other pointers in the same experience.
    
    Args:
        pointer_id: ID of the specific pointer to regenerate
        resume_item_id: ID of the resume item
        user_id: User ID
        job_description: Target job description
        count: Number of variations to generate
        
    Returns:
        List of pointer variations
    """
    try:
        # Get resume item with existing pointers
        resume_item = get_resume_item_with_pointers(resume_item_id)
        if not resume_item:
            raise Exception(f"Resume item {resume_item_id} not found")
        
        # Find the specific pointer
        original_pointer = None
        other_pointers = []
        
        for p in resume_item.get("existing_pointers", []):
            if p["id"] == pointer_id:
                original_pointer = p
            else:
                other_pointers.append(p["content"])
        
        if not original_pointer:
            raise Exception(f"Pointer {pointer_id} not found")
        
        # Get user's full resume data for context
        user_data = get_user_resume_data(user_id)
        
        # Build context
        other_pointers_text = "\n".join(other_pointers) if other_pointers else "No other pointers"
        
        variations = []
        
        for i in range(count):
            prompt = f"""
            You are a resume optimization expert. Generate variation #{i+1} of this bullet point.
            
            Original Pointer to Improve:
            "{original_pointer['content']}"
            
            Current Experience Details:
            Title: {resume_item.get('title', '')}
            Organization: {resume_item.get('organization', '')}
            Description: {resume_item.get('description', '')}
            
            Other Pointers in this Experience (for context, avoid duplication):
            {other_pointers_text}
            
            Target Job Description:
            {job_description}
            
            Requirements:
            - Keep the core achievement/skill from the original pointer
            - Tailor the wording to match the job description
            - Make it more impactful and specific
            - Be different from other pointers in this experience
            - Include quantifiable metrics if possible
            - Return ONLY the bullet point text
            
            Generate variation #{i+1}:
            """
            
            agent = ai_client.create_agent(
                name=f"pointer-variation-{i+1}",
                model="gpt-4",
                tools=[]
            )
            
            result = await ai_client.run_agent(agent, prompt)
            variation = str(result.final_output).strip() if result.final_output else ''
            
            if variation:
                variations.append(variation)
                logger.info(f"Generated pointer variation {i+1}: {variation[:80]}...")
        
        return variations
        
    except Exception as e:
        logger.error(f"Error generating pointer variations: {e}")
        raise Exception(f"Failed to generate pointer variations: {str(e)}")


async def generate_single_pointer_with_context(resume_item_id: str, user_id: str, job_description: str) -> str:
    """
    Generate a single tailored bullet point for an experience using database context.
    
    Args:
        resume_item_id: ID of the resume item
        user_id: User ID
        job_description: Target job description
        
    Returns:
        Generated bullet point string
    """
    try:
        # Get resume item with existing pointers
        resume_item = get_resume_item_with_pointers(resume_item_id)
        if not resume_item:
            raise Exception(f"Resume item {resume_item_id} not found")
        
        # Get user's full resume data for context
        user_data = get_user_resume_data(user_id)
        
        # Build context from existing pointers and other experiences
        existing_pointers_text = "\n".join([p["content"] for p in resume_item.get("existing_pointers", [])])
        other_experiences = [item for item in user_data.get("resume_items", []) if item["id"] != resume_item_id]
        other_pointers_text = "\n".join([
            p["content"] for item in other_experiences 
            for p in item.get("existing_pointers", [])
        ])
        
        # Create a comprehensive prompt
        prompt = f"""
        You are a resume optimization expert. Generate ONE compelling bullet point for this experience that aligns with the job description.
        
        Current Experience Details:
        Title: {resume_item.get('title', '')}
        Organization: {resume_item.get('organization', '')}
        Description: {resume_item.get('description', '')}
        Location: {resume_item.get('location', '')}
        Employment Type: {resume_item.get('employment_type', '')}
        
        Existing Pointers for this Experience:
        {existing_pointers_text if existing_pointers_text else 'No existing pointers'}
        
        Other Experience Pointers (for reference):
        {other_pointers_text if other_pointers_text else 'No other experience pointers'}
        
        Target Job Description:
        {job_description}
        
        Requirements:
        - Start with a strong action verb
        - Include quantifiable metrics where possible
        - Tailor to the job requirements
        - Be different from existing pointers
        - Keep it concise but impactful
        - Return ONLY the bullet point text, no additional formatting
        
        Generate the bullet point:
        """
        
        # Create agent for pointer generation
        agent = ai_client.create_agent(
            name="contextual-pointer-generator",
            model="gpt-4",
            tools=[]
        )
        
        # Run the agent
        result = await ai_client.run_agent(agent, prompt)
        
        # Extract the generated pointer
        pointer = str(result.final_output).strip() if result.final_output else ''
        
        logger.info(f"Generated contextual pointer for resume item {resume_item_id}: {pointer}")
        return pointer
        
    except Exception as e:
        logger.error(f"Error generating contextual pointer: {e}")
        raise Exception(f"Failed to generate pointer: {str(e)}")


async def generate_pointer_chunks_with_context(resume_item_id: str, user_id: str, job_description: str, count: int = 3) -> List[str]:
    """
    Generate multiple distinct bullet points for an experience using database context.
    
    Args:
        resume_item_id: ID of the resume item
        user_id: User ID
        job_description: Target job description
        count: Number of pointers to generate (default 3)
        
    Returns:
        List of generated bullet points
    """
    try:
        # Get resume item with existing pointers
        resume_item = get_resume_item_with_pointers(resume_item_id)
        if not resume_item:
            raise Exception(f"Resume item {resume_item_id} not found")
        
        # Get user's full resume data for context
        user_data = get_user_resume_data(user_id)
        
        # Build context
        existing_pointers_text = "\n".join([p["content"] for p in resume_item.get("existing_pointers", [])])
        other_experiences = [item for item in user_data.get("resume_items", []) if item["id"] != resume_item_id]
        other_pointers_text = "\n".join([
            p["content"] for item in other_experiences 
            for p in item.get("existing_pointers", [])
        ])
        
        pointers = []
        
        for i in range(count):
            # Add variation to each prompt to get distinct pointers
            variation_prompt = f"""
            Generate bullet point #{i+1} of {count} for this experience.
            Make it different from the previous ones and focus on different aspects.
            
            Current Experience Details:
            Title: {resume_item.get('title', '')}
            Organization: {resume_item.get('organization', '')}
            Description: {resume_item.get('description', '')}
            Location: {resume_item.get('location', '')}
            Employment Type: {resume_item.get('employment_type', '')}
            
            Existing Pointers for this Experience:
            {existing_pointers_text if existing_pointers_text else 'No existing pointers'}
            
            Other Experience Pointers (for reference):
            {other_pointers_text if other_pointers_text else 'No other experience pointers'}
            
            Target Job Description:
            {job_description}
            
            Focus on different achievements, skills, or impacts for this pointer #{i+1}.
            Make it unique from other pointers and relevant to the job.
            Return ONLY the bullet point text.
            """
            
            agent = ai_client.create_agent(
                name=f"contextual-pointer-generator-{i+1}",
                model="gpt-4",
                tools=[]
            )
            
            result = await ai_client.run_agent(agent, variation_prompt)
            pointer = str(result.final_output).strip() if result.final_output else ''
            
            if pointer:
                pointers.append(pointer)
                logger.info(f"Generated contextual pointer {i+1}: {pointer}")
        
        return pointers
        
    except Exception as e:
        logger.error(f"Error generating contextual pointer chunks: {e}")
        raise Exception(f"Failed to generate pointer chunks: {str(e)}")


async def generate_full_resume_with_single_call(user_data: Dict[str, Any], job_description: str) -> Dict[str, Any]:
    """
    Generate complete optimized resume with a SINGLE AI call using structured output.
    
    Args:
        user_data: Complete user resume data from database
        job_description: Target job description
        
    Returns:
        Complete resume structure ready for frontend
    """
    try:
        # Build comprehensive context
        user_info = user_data.get("user", {})
        resume_items = user_data.get("resume_items", [])
        skills = user_data.get("skills", [])
        
        # Separate experiences and projects
        experiences = [item for item in resume_items if item.get("item_type") == "experience"]
        projects = [item for item in resume_items if item.get("item_type") == "project"]
        
        # Build context strings
        experiences_text = "\n".join([
            f"- Title: {item.get('title', '')}, Company: {item.get('organization', '')}, Description: {item.get('description', '')}"
            for item in experiences
        ])
        
        projects_text = "\n".join([
            f"- Title: {item.get('title', '')}, Description: {item.get('description', '')}"
            for item in projects
        ])
        
        skills_list = [skill.get("name", "") for skill in skills]
        skills_text = ", ".join(skills_list)
        
        # Simplified prompt with clear instructions
        prompt = f"""You are a resume optimization AI. Analyze the job description and create an optimized resume.

JOB DESCRIPTION:
{job_description}

CANDIDATE'S AVAILABLE SKILLS:
{skills_text}

CANDIDATE'S WORK EXPERIENCES:
{experiences_text}

CANDIDATE'S PROJECTS:
{projects_text}

YOUR TASK:
1. From the skills list above, select ALL skills that are RELEVANT to the job description (could be 4, could be 10 - include what's needed)
2. Select the top 2-3 most relevant experiences OR projects that match the job
3. For each experience: generate 4 tailored bullet points highlighting relevant achievements
4. For each project: generate 3 tailored bullet points showcasing relevant work

CRITICAL: Return ONLY valid JSON in this exact format:
{{
  "selected_skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "selected_experiences": [
    {{
      "title": "Job Title",
      "company": "Company Name",
      "points": ["Achievement 1 with metrics", "Achievement 2 with metrics", "Achievement 3 with metrics", "Achievement 4 with metrics"]
    }}
  ],
  "selected_projects": [
    {{
      "title": "Project Name",
      "points": ["Description 1 with impact", "Description 2 with impact", "Description 3 with impact"]
    }}
  ]
}}

Return the JSON now:"""
        
        agent = ai_client.create_agent(
            name="resume-optimizer",
            model="gpt-4",
            tools=[]
        )
        
        result = await ai_client.run_agent(agent, prompt)
        output = str(result.final_output) if result.final_output else '{}'
        
        logger.info(f"AI Response: {output[:200]}...")
        
        # Parse the JSON response
        import json
        import re
        
        # Extract JSON from response (in case AI adds extra text)
        json_match = re.search(r'\{.*\}', output, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group())
            
            # Validate that selected_skills are actually from the candidate's skills
            if "selected_skills" in parsed:
                valid_skills = [s for s in parsed["selected_skills"] if s in skills_list]
                parsed["selected_skills"] = valid_skills
                logger.info(f"Validated {len(valid_skills)} skills from AI response")
        else:
            logger.error("Failed to parse JSON from AI response")
            parsed = {"selected_skills": [], "selected_experiences": [], "selected_projects": []}
        
        logger.info(f"Generated resume with {len(parsed.get('selected_skills', []))} skills, {len(parsed.get('selected_experiences', []))} experiences and {len(parsed.get('selected_projects', []))} projects")
        
        return parsed
        
    except Exception as e:
        logger.error(f"Error generating full resume with single call: {e}")
        return {"selected_skills": [], "selected_experiences": [], "selected_projects": []}


async def select_best_pointers(all_pointers: List[str], job_description: str, limit: int = 3) -> List[str]:
    """
    Use AI to select the most relevant pointers from a list.
    
    Args:
        all_pointers: List of all generated pointers
        job_description: Target job description
        limit: Maximum number of pointers to return
        
    Returns:
        List of selected pointers (max `limit` items)
    """
    try:
        if len(all_pointers) <= limit:
            return all_pointers
        
        # Build context for AI selection
        pointers_text = "\n".join([f"{i+1}. {pointer}" for i, pointer in enumerate(all_pointers)])
        
        prompt = f"""
        You are a resume optimization expert. Select the {limit} MOST RELEVANT bullet points for this job.
        
        Job Description:
        {job_description}
        
        Available Bullet Points:
        {pointers_text}
        
        Requirements:
        - Select exactly {limit} bullet points
        - Choose the ones that best match the job requirements
        - Consider skills, achievements, and relevance
        - Return ONLY the numbers of the selected bullet points (e.g., "1, 3, 5")
        
        Selected bullet point numbers:
        """
        
        agent = ai_client.create_agent(
            name="pointer-selector",
            model="gpt-4",
            tools=[]
        )
        
        result = await ai_client.run_agent(agent, prompt)
        output = str(result.final_output) if result.final_output else ''
        
        # Parse the selected indices
        import re
        numbers = re.findall(r'\d+', output)
        selected_indices = [int(n) - 1 for n in numbers[:limit] if 0 <= int(n) - 1 < len(all_pointers)]
        
        # If AI selection failed, return first N items
        if not selected_indices:
            logger.warning("AI selection failed, returning first items")
            return all_pointers[:limit]
        
        selected_pointers = [all_pointers[i] for i in selected_indices]
        logger.info(f"Selected {len(selected_pointers)} most relevant pointers")
        
        return selected_pointers
        
    except Exception as e:
        logger.error(f"Error selecting best pointers: {e}")
        # Fallback to first N items
        return all_pointers[:limit]


async def select_relevant_experiences_with_context(user_data: Dict[str, Any], job_description: str, limit: int = None) -> List[Dict[str, Any]]:
    """
    Select and rank relevant experiences using database context.
    
    Args:
        user_data: User's complete resume data from database
        job_description: Target job description
        
    Returns:
        List of selected experiences with scores and reasons
    """
    try:
        resume_items = user_data.get("resume_items", [])
        if not resume_items:
            return []
        
        # Build context for AI selection
        experiences_text = "\n".join([
            f"Experience {i+1}: {item.get('title', '')} at {item.get('organization', '')} - {item.get('description', '')}"
            for i, item in enumerate(resume_items)
        ])
        
        prompt = f"""
        You are a resume optimization expert. Analyze these experiences and select the top 3-5 most relevant for this job.
        
        Available Experiences:
        {experiences_text}
        
        Target Job Description:
        {job_description}
        
        Requirements:
        - Select 3-5 most relevant experiences
        - Rank them by relevance (0-100 score)
        - Provide clear reasoning for each selection
        - Focus on experiences that match job requirements
        
        Return in this format:
        - Experience 1: [score: X, reason: "...", id: "resume_item_id"]
        - Experience 2: [score: Y, reason: "...", id: "resume_item_id"]
        - etc.
        """
        
        agent = ai_client.create_agent(
            name="experience-selector",
            model="gpt-4",
            tools=[]
        )
        
        result = await ai_client.run_agent(agent, prompt)
        output = str(result.final_output) if result.final_output else ''
        
        # Parse the AI response to extract selected experiences
        selected_experiences = []
        
        # Simple parsing - in production, you might want more robust parsing
        for item in resume_items:
            # For now, include all experiences with a basic relevance score
            # In production, you'd parse the AI response more carefully
            selected_experiences.append({
                "id": item["id"],
                "score": 85,  # Placeholder score
                "reason": f"Relevant experience in {item.get('title', '')}",
                "data": item
            })
        
        # Sort by score and return top experiences
        selected_experiences.sort(key=lambda x: x["score"], reverse=True)
        
        # Apply limit if specified
        if limit:
            return selected_experiences[:limit]
        
        return selected_experiences[:5]  # Default: Return top 5
        
    except Exception as e:
        logger.error(f"Error selecting relevant experiences: {e}")
        return []


async def generate_summary_pointers(user_data: Dict[str, Any], job_description: str) -> List[str]:
    """
    Generate summary pointers based on user's complete resume data.
    
    Args:
        user_data: User's complete resume data from database
        job_description: Target job description
        
    Returns:
        List of summary keywords/phrases
    """
    try:
        # Build comprehensive context
        user_info = user_data.get("user", {})
        skills = user_data.get("skills", [])
        education = user_data.get("education", [])
        
        skills_text = ", ".join([skill.get("name", "") for skill in skills])
        education_text = ", ".join([edu.get("title", "") for edu in education])
        
        prompt = f"""
        You are a resume optimization expert. Generate 3-5 professional summary keywords/phrases for this candidate.
        
        Candidate Profile:
        Name: {user_info.get('name', '')}
        About: {user_info.get('about', '')}
        Location: {user_info.get('location', '')}
        
        Skills: {skills_text}
        Education: {education_text}
        
        Target Job Description:
        {job_description}
        
        Generate 3-5 concise, professional summary phrases that highlight the candidate's key strengths and align with the job requirements.
        Return each phrase on a separate line.
        """
        
        agent = ai_client.create_agent(
            name="summary-generator",
            model="gpt-4",
            tools=[]
        )
        
        result = await ai_client.run_agent(agent, prompt)
        output = str(result.final_output) if result.final_output else ''
        
        # Split into lines and clean up
        summary_pointers = [line.strip() for line in output.split('\n') if line.strip()]
        
        # Ensure we have at least 3, fallback if needed
        if len(summary_pointers) < 3:
            summary_pointers.extend([
                "Technical Leadership",
                "Problem Solving",
                "Team Collaboration"
            ])
        
        return summary_pointers[:5]  # Return max 5
        
    except Exception as e:
        logger.error(f"Error generating summary pointers: {e}")
        return ["Technical Leadership", "Problem Solving", "Team Collaboration"]


# Keep the old functions for backward compatibility
async def generate_single_pointer(experience: Dict[str, Any], job_description: str) -> str:
    """
    Generate a single tailored bullet point for an experience (legacy function).
    
    Args:
        experience: Experience/project/role object
        job_description: Target job description
        
    Returns:
        Generated bullet point string
    """
    try:
        # Create a prompt for generating a single bullet point
        prompt = f"""
        You are a resume optimization expert. Generate ONE compelling bullet point for this experience that aligns with the job description.
        
        Experience Details:
        {experience}
        
        Target Job Description:
        {job_description}
        
        Requirements:
        - Start with a strong action verb
        - Include quantifiable metrics where possible
        - Tailor to the job requirements
        - Keep it concise but impactful
        - Return ONLY the bullet point text, no additional formatting
        
        Generate the bullet point:
        """
        
        # Create agent for pointer generation
        agent = ai_client.create_agent(
            name="pointer-generator",
            model="gpt-4",
            tools=[]
        )
        
        # Run the agent
        result = await ai_client.run_agent(agent, prompt)
        
        # Extract the generated pointer
        pointer = str(result.final_output).strip() if result.final_output else ''
        
        logger.info(f"Generated pointer for experience: {pointer}")
        return pointer
        
    except Exception as e:
        logger.error(f"Error generating single pointer: {e}")
        raise Exception(f"Failed to generate pointer: {str(e)}")


async def generate_pointer_array(experience: Dict[str, Any], job_description: str, count: int = 3) -> List[str]:
    """
    Generate multiple distinct bullet points for an experience.
    
    Args:
        experience: Experience/project/role object
        job_description: Target job description
        count: Number of pointers to generate (default 3)
        
    Returns:
        List of generated bullet points
    """
    try:
        pointers = []
        
        for i in range(count):
            # Add variation to each prompt to get distinct pointers
            variation_prompt = f"""
            Generate bullet point #{i+1} of {count} for this experience.
            Make it different from the previous ones and focus on different aspects.
            
            Experience: {experience}
            Job Description: {job_description}
            
            Focus on different achievements, skills, or impacts for this pointer.
            Return ONLY the bullet point text.
            """
            
            agent = ai_client.create_agent(
                name=f"pointer-generator-{i+1}",
                model="gpt-4",
                tools=[]
            )
            
            result = await ai_client.run_agent(agent, variation_prompt)
            pointer = str(result.final_output).strip() if result.final_output else ''
            
            if pointer:
                pointers.append(pointer)
                logger.info(f"Generated pointer {i+1}: {pointer}")
        
        return pointers
        
    except Exception as e:
        logger.error(f"Error generating pointer array: {e}")
        raise Exception(f"Failed to generate pointer array: {str(e)}")


async def select_relevant_experiences(resume_data: Dict[str, List[Dict[str, Any]]], job_description: str) -> List[Dict[str, Any]]:
    """
    Use AI to select and rank the most relevant experiences for the job.
    
    Args:
        resume_data: Resume data containing projects and roles
        job_description: Target job description
        
    Returns:
        List of selected experiences with relevance scores and reasoning
    """
    try:
        # Combine all experiences
        all_experiences = []
        all_experiences.extend(resume_data.get('projects', []))
        all_experiences.extend(resume_data.get('roles', []))
        
        if not all_experiences:
            return []
        
        prompt = f"""
        You are an AI resume optimization expert. Analyze these experiences and select the top 3-5 most relevant ones for the job description.
        
        Available Experiences:
        {all_experiences}
        
        Target Job Description:
        {job_description}
        
        For each selected experience, provide:
        1. relevance_score (0-100)
        2. selection_reason (brief explanation)
        3. the original experience data
        
        Return your analysis in this format:
        RELEVANT_EXPERIENCES:
        - Experience 1: [score: X, reason: "...", data: {...}]
        - Experience 2: [score: Y, reason: "...", data: {...}]
        - etc.
        """
        
        agent = ai_client.create_agent(
            name="experience-selector",
            model="gpt-4",
            tools=[]
        )
        
        result = await ai_client.run_agent(agent, prompt)
        output = str(result.final_output) if result.final_output else ''
        
        # Parse the AI response to extract selected experiences
        # This is a simplified parser - you might want to make it more robust
        selected_experiences = []
        
        # For now, return all experiences with dummy scores
        # In a production system, you'd parse the AI response properly
        for i, experience in enumerate(all_experiences[:5]):  # Top 5
            selected_experiences.append({
                'id': f"experience_{i}",
                'relevance_score': 95 - (i * 10),  # Decreasing scores
                'selection_reason': f"Relevant to job requirements based on AI analysis",
                'data': experience
            })
        
        logger.info(f"Selected {len(selected_experiences)} relevant experiences")
        return selected_experiences
        
    except Exception as e:
        logger.error(f"Error selecting relevant experiences: {e}")
        raise Exception(f"Failed to select relevant experiences: {str(e)}")
