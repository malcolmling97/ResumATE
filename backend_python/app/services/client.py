"""AI client service for creating and managing OpenAI agents."""

from agents import set_default_openai_key, Agent, Runner, function_tool, WebSearchTool
from app.config.settings import settings


class AIClient:
    """Client for AI-related operations using OpenAI agents."""
    
    def __init__(self):
        """Initialize AI client with OpenAI API key."""
        if not settings.OPENAI_API_KEY:
            raise RuntimeError("Missing OPENAI_API_KEY environment variable")
        set_default_openai_key(settings.OPENAI_API_KEY)
    
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


# Global AI client instance
ai_client = AIClient()
