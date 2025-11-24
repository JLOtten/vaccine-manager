# Vaccine Manager Application Guide

## Overview

The Vaccine Manager is a personal/family vaccination record application with:

- **Backend**: Python FastAPI application (runs on port 9090)
- **Frontend**: React TypeScript application (runs on port 3000)
- **Database**: SQLite (stored in `backend/sql_app.db`)

## Prerequisites

- Python 3.12+, `uv` package manager
- Node.js, npm, `pnpm` package manager

## Running the Application

### Backend

```bash
cd backend
uv sync
source .venv/bin/activate
make run
# API available at http://localhost:9090
```

### Frontend

```bash
cd frontend
pnpm install
pnpm start
# Application available at http://localhost:3000
```

### Both Services

```bash
make run
# Starts both backend (port 9090) and frontend (port 3000) servers
```

## Pre-Commit Checklist

**IMPORTANT**: Before committing code, ensure the following:

1. **Format all code**:

   ```bash
   make format
   # Or format individually:
   # make format-backend
   # make format-frontend
   ```

2. **Run all tests**:

   ```bash
   make test
   # Or test individually:
   # make test-backend
   # make test-frontend
   ```

3. **Run linting** (optional but recommended):
   ```bash
   make lint
   # Or lint individually:
   # make lint-backend
   # make lint-frontend
   ```

The `make ci` target runs both linting and tests, which is useful for CI/CD pipelines.

## Code Structure

### Backend (`backend/`)

```
backend/
├── vaccine_manager/
│   ├── main.py              # FastAPI routes
│   ├── models.py            # SQLAlchemy models
│   ├── pydantic_models.py   # Request/response schemas
│   ├── db.py                # Database setup
│   └── test_main.py         # Tests
├── pyproject.toml
└── Makefile
```

### Frontend (`frontend/`)

```
frontend/
├── src/
│   ├── components/          # React components
│   ├── App.tsx              # Main app with routing
│   └── index.tsx            # Entry point
├── package.json
└── tsconfig.json
```

## Attribution Requirements

AI agents must disclose what tool and model they are using in the "Assisted-by" commit footer:

```text
Assisted-by: [Model Name] via [Tool Name]
```

Example:

```text
Assisted-by: GLM 4.6 via Claude Code
```
