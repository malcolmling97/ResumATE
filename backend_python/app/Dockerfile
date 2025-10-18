FROM python:3.11-slim

WORKDIR /app

# Install uv
RUN pip install uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --locked --no-dev

# Copy the rest of the app
COPY . .

# Use shell form to allow $PORT variable expansion
CMD uv run uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}