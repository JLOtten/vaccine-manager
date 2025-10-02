.PHONY: run install test

# Default target
help:
	@echo "Available targets:"
	@echo "  run      - Start the FastAPI server"
	@echo "  install  - Install dependencies using uv"
	@echo "  test     - Run tests"
	@echo "  help     - Show this help message"

# Start the FastAPI server
run:
	uv run fastapi run vaccine_manager/main.py --port 9090

# Install dependencies
install:
	uv sync

# Run tests
test:
	uv run pytest
