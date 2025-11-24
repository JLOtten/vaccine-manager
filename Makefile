.PHONY: help test lint ci test-backend test-frontend lint-backend lint-frontend format format-backend format-frontend run

# Default target
help:
	@echo "Available targets:"
	@echo "  run             - Start both backend and frontend servers"
	@echo "  ci              - Run linting + tests (for CI/CD)"
	@echo "  test            - Run all tests (backend + frontend)"
	@echo "  test-backend    - Run backend tests"
	@echo "  test-frontend   - Run frontend tests"
	@echo "  lint            - Run all linting (backend + frontend)"
	@echo "  lint-backend    - Run backend linting"
	@echo "  lint-frontend   - Run frontend linting"
	@echo "  format          - Format all code (backend + frontend)"
	@echo "  format-backend  - Format backend code"
	@echo "  format-frontend - Format frontend code"

# Start both backend and frontend servers
run:
	@echo "Starting backend and frontend servers..."
	@echo "Backend will be available at http://localhost:9090"
	@echo "Frontend will be available at http://localhost:3000"
	@echo "Press Ctrl+C to stop both servers"
	@trap 'kill 0' EXIT; \
	(cd backend && make run) & \
	(cd frontend && pnpm start) & \
	wait

# CI target: run linting then tests
ci: lint test

# Run all tests
test: test-backend test-frontend

# Run backend tests
test-backend:
	@echo "Running backend tests..."
	cd backend && uv run pytest -v

# Run frontend tests
test-frontend:
	@echo "Running frontend tests..."
	cd frontend && pnpm test:ci

# Run all linting
lint: lint-backend lint-frontend

# Run backend linting
lint-backend:
	@echo "Running backend linting..."
	cd backend && uv run ruff check . && uv run ruff format --check .

# Run frontend linting
lint-frontend:
	@echo "Running frontend linting..."
	cd frontend && pnpm format:check && pnpm type-check && pnpm build

# Format all code
format: format-backend format-frontend

# Format backend code
format-backend:
	@echo "Formatting backend code..."
	cd backend && uv run ruff format . && uv run ruff check --fix .

# Format frontend code
format-frontend:
	@echo "Formatting frontend code..."
	cd frontend && pnpm format

