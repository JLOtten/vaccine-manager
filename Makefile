.PHONY: help dev build typecheck install

# Default target
help:
	@echo "Available targets:"
	@echo "  install    - Install dependencies"
	@echo "  dev        - Start development server"
	@echo "  build      - Build for production"
	@echo "  typecheck  - Run TypeScript type checking"
	@echo "  start      - Preview production build"

# Install dependencies
install:
	@echo "Installing dependencies..."
	pnpm install

# Start development server
dev:
	@echo "Starting development server..."
	@echo "Application will be available at http://localhost:3000"
	pnpm run dev

# Build for production
build:
	@echo "Building for production..."
	pnpm run build

# Type checking
typecheck:
	@echo "Running TypeScript type checking..."
	pnpm run typecheck

# Preview production build
start:
	@echo "Starting production preview..."
	pnpm start

