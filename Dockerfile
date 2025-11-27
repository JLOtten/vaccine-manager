# Multi-stage build for Vaccine Manager
# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package.json frontend/pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# Copy frontend source and build
COPY frontend/ ./
RUN pnpm build

# Stage 2: Backend with frontend static files
FROM python:3.13-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Copy backend files needed for package building
COPY backend/pyproject.toml backend/uv.lock* backend/README.md ./
COPY backend/vaccine_manager/ ./vaccine_manager/

# Install Python dependencies (requires package directory to be present)
RUN uv sync --frozen

# Copy rest of backend directory structure (in case there are other files needed)
COPY backend/ ./backend/

# Copy built frontend static files from frontend-builder
COPY --from=frontend-builder /app/frontend/dist ./static

# Expose port (Fly.io uses PORT env var)
EXPOSE 9090

# Run the application (use PORT env var if set, otherwise default to 9090)
CMD ["sh", "-c", "uv run uvicorn vaccine_manager.main:app --host 0.0.0.0 --port ${PORT:-9090}"]

