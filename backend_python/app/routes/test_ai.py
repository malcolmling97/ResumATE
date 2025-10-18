"""Test AI service routes for experimenting with OpenAI agents."""

import logging
from typing import Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.test_ai_service import test_ai_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/test", tags=["test-ai"])


class TestAIPayload(BaseModel):
    """Payload model for testing AI service."""
    prompt: str = "Tell me something fascinating about quantum computing and its potential impact on cryptography"
    model: str = "gpt-4"
    tools: list = []


class TestAIResponse(BaseModel):
    """Response model for test AI service."""
    success: bool
    prompt: str
    model_used: str
    response: str
    metadata: Dict[str, Any]
    error: str = None


@router.post("/ai-payload", response_model=TestAIResponse)
async def test_ai_payload(payload: TestAIPayload):
    """
    Test the AI service with a custom payload.
    
    This endpoint allows you to test individual tokens and responses
    by sending custom prompts to the OpenAI Agents SDK.
    """
    try:
        logger.info(f"Testing AI service with prompt: {payload.prompt[:50]}...")
        
        # Convert Pydantic model to dict
        payload_dict = payload.dict()
        
        # Process the payload
        result = await test_ai_service.process_payload(payload_dict)
        
        if result["success"]:
            return TestAIResponse(
                success=True,
                prompt=result["prompt"],
                model_used=result["model_used"],
                response=result["response"],
                metadata=result["metadata"]
            )
        else:
            return TestAIResponse(
                success=False,
                prompt=result["prompt"],
                model_used="",
                response=result["response"],
                metadata={},
                error=result.get("error", "Unknown error")
            )
        
    except Exception as e:
        logger.error(f"Error in test_ai_payload: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process AI payload: {str(e)}")


@router.get("/ai-default")
async def test_ai_default():
    """
    Test the AI service with default payload.
    
    Returns something interesting using the default prompt.
    """
    try:
        logger.info("Testing AI service with default payload")
        
        # Get default test payload
        default_payload = test_ai_service.get_default_test_payload()
        
        # Process the payload
        result = await test_ai_service.process_payload(default_payload)
        
        return result
        
    except Exception as e:
        logger.error(f"Error in test_ai_default: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process default AI payload: {str(e)}")


@router.get("/ai-info")
async def get_ai_info():
    """Get information about the test AI service configuration."""
    return {
        "service_name": "Test AI Service",
        "description": "Service for testing OpenAI agents and tokens",
        "default_model": "gpt-4",
        "default_tools": ["WebSearchTool"],
        "default_prompt": "Tell me something fascinating about quantum computing and its potential impact on cryptography",
        "available_endpoints": [
            "POST /api/test/ai-payload - Test with custom payload",
            "GET /api/test/ai-default - Test with default payload",
            "GET /api/test/ai-info - Get service information"
        ]
    }
