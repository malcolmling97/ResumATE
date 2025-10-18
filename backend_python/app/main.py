"""Main FastAPI application."""

from fastapi import FastAPI

from app.config.settings import settings, setup_logging
from app.database.supabase import get_supabase_client
from app.routes import health, root, resume


def create_app() -> FastAPI:
    """Create and configure the FastAPI application.
    
    Returns:
        Configured FastAPI application instance
    """
    # Setup logging
    logger = setup_logging()
    
    # Create FastAPI app
    app = FastAPI(
        title=settings.APP_TITLE,
        version=settings.APP_VERSION
    )
    
    # Include routers
    app.include_router(root.router)
    app.include_router(health.router)
    app.include_router(resume.router)
    
    # Startup event
    @app.on_event("startup")
    async def startup_event():
        logger.info("Starting ResumATE AI Agent backend")
        app.state.supabase = get_supabase_client()
        if app.state.supabase:
            logger.info("Supabase client configured successfully")
        else:
            logger.warning("Supabase client not configured - check environment variables")
    
    return app


# Create the app instance
app = create_app()
