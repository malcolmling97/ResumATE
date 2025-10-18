"""AI client service for creating and managing OpenAI agents."""

from agents import set_default_openai_key, Agent, Runner, function_tool, WebSearchTool, ModelSettings
from app.config.settings import settings


class AIClient:
    """Client for AI-related operations using OpenAI agents."""
    
    def __init__(self):
        """Initialize AI client with OpenAI API key."""
        if not settings.OPENAI_API_KEY:
            raise RuntimeError("Missing OPENAI_API_KEY environment variable")
        set_default_openai_key(settings.OPENAI_API_KEY)
    
    def create_agent(self, name: str, model: str = "gpt-4", tools: list = None, temperature: float = None) -> Agent:
        """Create an AI agent with specified configuration.
        
        Args:
            name: Agent name
            model: OpenAI model to use
            tools: List of tools for the agent
            temperature: Sampling temperature (0.0-2.0). Lower = more deterministic, less hallucination
            
        Returns:
            Configured Agent instance
        """
        if tools is None:
            tools = [WebSearchTool()]
        
        # Build model settings with temperature if specified
        model_settings = None
        if temperature is not None:
            model_settings = ModelSettings(temperature=temperature)
        
        agent_kwargs = {
            "name": name,
            "model": model,
            "tools": tools
        }
        
        # Add model_settings if temperature was specified
        if model_settings is not None:
            agent_kwargs["model_settings"] = model_settings
            
        return Agent(**agent_kwargs)
    
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
