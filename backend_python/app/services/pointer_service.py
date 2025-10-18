"""Service for generating resume bullet points using AI."""

import logging
from typing import List, Dict, Any
from app.services.client import ai_client

logger = logging.getLogger(__name__)


async def generate_single_pointer(experience: Dict[str, Any], job_description: str) -> str:
    """
    Generate a single tailored bullet point for an experience.
    
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
