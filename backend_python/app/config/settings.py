"""Application configuration and environment settings."""

import os
import logging
from typing import Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


class Settings:
    """Application settings loaded from environment variables."""
    
    # OpenAI Configuration
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Supabase Configuration
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL")
    SUPABASE_KEY: Optional[str] = os.getenv("SUPABASE_KEY")
    SUPABASE_BUCKET: str = os.getenv("SUPABASE_BUCKET", "pdf-uploads")
    
    # Application Configuration
    APP_TITLE: str = "resumATE AI Agent"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Server Configuration
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    def __init__(self):
        """Initialize settings and validate required configuration."""
        # Validate required settings
        if not self.OPENAI_API_KEY:
            raise RuntimeError("Missing OPENAI_API_KEY environment variable")


# Global settings instance
settings = Settings()


def setup_logging():
    """Configure application logging."""
    logging.basicConfig(
        level=logging.DEBUG if settings.DEBUG else logging.INFO,
        format="%(asctime)s | %(levelname)-8s | %(module)s:%(funcName)s:%(lineno)d - %(message)s"
    )
    return logging.getLogger("uvicorn")
