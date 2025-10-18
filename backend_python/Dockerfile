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

# Run the app
CMD ["uv", "run", "python", "main.py"]