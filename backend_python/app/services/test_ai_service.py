"""Test AI service for experimenting with OpenAI agents and tokens."""

import logging
from typing import Dict, Any, Optional
from agents import set_default_openai_key, Agent, Runner, function_tool, WebSearchTool
from app.config.settings import settings

logger = logging.getLogger(__name__)


class TestAIService:
    """Test service for AI-related operations using OpenAI agents."""
    
    def __init__(self):
        """Initialize test AI service with OpenAI API key."""
        if not settings.OPENAI_API_KEY:
            raise RuntimeError("Missing OPENAI_API_KEY environment variable")
        set_default_openai_key(settings.OPENAI_API_KEY)
        logger.info("Test AI Service initialized")
    
    async def process_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process a payload containing a prompt and return AI response.
        
        Args:
            payload: Dictionary containing:
                - prompt: The input prompt for the AI
                - model: Optional model to use (defaults to "gpt-4")
                - tools: Optional list of tools (defaults to WebSearchTool)
                
        Returns:
            Dictionary containing the AI response and metadata
        """
        try:
            # Extract parameters from payload
            prompt = payload.get("prompt")
            if not prompt:
                # Default interesting prompt if none provided
                prompt = "Tell me something fascinating about quantum computing and its potential impact on cryptography"
            
            model = payload.get("model", "gpt-4")
            tools = payload.get("tools", [WebSearchTool()])
            
            logger.info(f"Processing payload with prompt: {prompt[:50]}...")
            
            # Create agent
            agent = self.create_agent(
                name="test-agent",
                model=model,
                tools=tools
            )
            
            # Run the agent
            result = await self.run_agent(agent, prompt)
            
            # Format response
            response = {
                "success": True,
                "prompt": prompt,
                "model_used": model,
                "response": str(result.final_output) if result.final_output else '',
                "metadata": {
                    "agent_name": "test-agent",
                    "tools_count": len(tools),
                    "prompt_length": len(prompt)
                }
            }
            
            logger.info(f"Successfully processed payload, response length: {len(response['response'])}")
            return response
            
        except Exception as e:
            logger.error(f"Error processing payload: {e}")
            return {
                "success": False,
                "error": str(e),
                "prompt": payload.get("prompt", ""),
                "response": "Something went wrong while processing your request."
            }
    
    def create_agent(self, name: str, model: str = "gpt-4", tools: list = None) -> Agent:
        """Create an AI agent with specified configuration.
        
        Args:
            name: Agent name
            model: OpenAI model to use
            tools: List of tools for the agent
            
        Returns:
            Configured Agent instance
        """
        if tools is None:
            tools = [WebSearchTool()]
            
        return Agent(
            name=name,
            model=model,
            tools=tools
        )
    
    async def run_agent(self, agent: Agent, prompt: str) -> dict:
        """Run an agent with a given prompt.
        
        Args:
            agent: Agent instance to run
            prompt: Input prompt for the agent
            
        Returns:
            Agent execution result
        """
        return await Runner.run(agent, prompt)
    
    def get_default_test_payload(self) -> Dict[str, Any]:
        """Get a default test payload with an interesting prompt."""
        return {
            "prompt": "Tell me something fascinating about quantum computing and its potential impact on cryptography",
            "model": "gpt-4",
            "tools": [WebSearchTool()]
        }


# Global test AI service instance
test_ai_service = TestAIService()