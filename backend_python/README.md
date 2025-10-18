# ResumATE Backend

A FastAPI-based backend for the ResumATE application with AI-powered resume processing capabilities.

## Project Structure

```
backend_python/
├── app/                          # Main application package
│   ├── __init__.py
│   ├── main.py                   # FastAPI application factory
│   ├── config/                   # Configuration management
│   │   ├── __init__.py
│   │   └── settings.py           # Environment settings and configuration
│   ├── database/                 # Database layer
│   │   ├── __init__.py
│   │   └── supabase.py           # Supabase client configuration
│   ├── routes/                   # API route handlers
│   │   ├── __init__.py
│   │   ├── health.py             # Health check endpoints
│   │   └── root.py               # Root endpoints
│   └── services/                 # Business logic layer
│       ├── __init__.py
│       └── ai_service.py         # AI/OpenAI agents service
├── main.py                       # Application entry point
├── pyproject.toml                # Project dependencies
└── README.md                     # This file
```

## Features

- **Modular Architecture**: Clean separation of concerns with dedicated modules for configuration, database, routes, and services
- **Environment-based Configuration**: Centralized settings management with environment variable support
- **Supabase Integration**: Database and storage client configuration
- **AI Service Layer**: OpenAI agents integration for resume processing
- **Health Monitoring**: Built-in health check endpoints
- **Development-friendly**: Hot reload support and comprehensive logging

## Getting Started

### Prerequisites

- Python 3.11+
- OpenAI API key
- Supabase account (optional)

### Installation

1. Install dependencies:
```bash
uv sync
```

2. Set up environment variables:
```bash
export OPENAI_API_KEY="your-openai-api-key"
export SUPABASE_URL="your-supabase-url"  # Optional
export SUPABASE_KEY="your-supabase-key"  # Optional
export DEBUG="true"  # Optional, for development
```

### Running the Application

```bash
uv run python main.py
```

The application will start on `http://127.0.0.1:8000` by default.

### API Documentation

Once running, visit:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Development

### Adding New Routes

1. Create a new router in `app/routes/`
2. Import and include it in `app/main.py`

### Adding New Services

1. Create service classes in `app/services/`
2. Import and use them in your routes

### Configuration

All configuration is managed through `app/config/settings.py`. Add new settings by extending the `Settings` class.

## Architecture Benefits

- **Maintainability**: Each module has a single responsibility
- **Testability**: Services and routes can be tested independently
- **Scalability**: Easy to add new features without cluttering main files
- **Team Development**: Multiple developers can work on different modules
- **Code Reusability**: Services can be shared across different routes
