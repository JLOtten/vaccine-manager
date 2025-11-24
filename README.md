# vaccine-manager
A personal/family vaccination record application based on UX Case Study with complete Figma hi-fi prototype. 

## developing

Server-side code is in `backend/` and is a Python app using FastAPI

Front-end client is in `frontend/` and is a React app

See individual folder README for more info

## linting and formatting

Before committing, ensure code is properly formatted:

**Frontend:**
```bash
cd frontend
pnpm run format        # Format code
pnpm run format:check  # Check formatting
pnpm run type-check    # Check TypeScript types
```

**Backend:**
```bash
cd backend
uv run ruff check .     # Check linting
uv run ruff format --check .  # Check formatting
uv run ruff format .    # Format code
```

CI workflows will automatically check formatting on pull requests.
