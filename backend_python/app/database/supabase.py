"""Supabase database client configuration and utilities."""

from typing import Optional
from supabase import create_client, Client

from app.config.settings import settings


def get_supabase_client() -> Optional[Client]:
    """Create and return a Supabase client using environment variables.
    
    Returns:
        Supabase client instance or None if configuration is missing.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        return None
    
    try:
        return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    except Exception as e:
        print(f"Failed to create Supabase client: {e}")
        return None


def get_supabase_bucket_name() -> str:
    """Get the Supabase storage bucket name from settings."""
    return settings.SUPABASE_BUCKET
