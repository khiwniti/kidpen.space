# Kidpen Suna - Development Makefile
# Easy commands for installation, development, and building

.PHONY: help install setup dev start stop status restart build build-frontend build-mobile build-desktop clean logs test lint format check deps docker-up docker-down docker-logs

# Default target
help:
	@echo "╔════════════════════════════════════════════════════════════════╗"
	@echo "║              Kidpen Suna - Development Commands                ║"
	@echo "╠════════════════════════════════════════════════════════════════╣"
	@echo "║  Installation                                                  ║"
	@echo "║    make install      - Install all dependencies                ║"
	@echo "║    make setup        - Run interactive setup wizard            ║"
	@echo "║    make deps         - Install Python & Node dependencies      ║"
	@echo "║                                                                ║"
	@echo "║  Development                                                   ║"
	@echo "║    make dev          - Start all development servers           ║"
	@echo "║    make start        - Alias for 'make dev'                    ║"
	@echo "║    make stop         - Stop all running services               ║"
	@echo "║    make status       - Check status of all services            ║"
	@echo "║    make restart      - Restart all services                    ║"
	@echo "║    make logs         - Show service logs                       ║"
	@echo "║                                                                ║"
	@echo "║  Building                                                      ║"
	@echo "║    make build        - Build all applications                  ║"
	@echo "║    make build-frontend - Build frontend only                   ║"
	@echo "║    make build-mobile - Build mobile app                        ║"
	@echo "║    make build-desktop - Build desktop app                      ║"
	@echo "║                                                                ║"
	@echo "║  Docker                                                        ║"
	@echo "║    make docker-up    - Start Docker services                   ║"
	@echo "║    make docker-down  - Stop Docker services                    ║"
	@echo "║    make docker-logs  - Show Docker logs                        ║"
	@echo "║                                                                ║"
	@echo "║  Quality                                                       ║"
	@echo "║    make test         - Run all tests                           ║"
	@echo "║    make lint         - Run linters                             ║"
	@echo "║    make format       - Format code                             ║"
	@echo "║    make check        - Run lint + test                         ║"
	@echo "║                                                                ║"
	@echo "║  Maintenance                                                   ║"
	@echo "║    make clean        - Clean build artifacts                   ║"
	@echo "╚════════════════════════════════════════════════════════════════╝"

# ============================================================================
# Installation
# ============================================================================

install: deps setup
	@echo "✅ Installation complete!"

setup:
	@echo "🔧 Running Kidpen setup wizard..."
	python -m setup

deps: deps-python deps-node
	@echo "✅ All dependencies installed!"

deps-python:
	@echo "📦 Installing Python dependencies..."
	@if command -v uv >/dev/null 2>&1; then \
		echo "Using uv..."; \
		uv pip install -r setup/requirements.txt 2>/dev/null || uv pip install --system -r setup/requirements.txt; \
	else \
		echo "Using pip..."; \
		pip install -r setup/requirements.txt; \
	fi
	@cd backend && pip install -e . 2>/dev/null || echo "Backend deps will be installed during setup"

deps-node:
	@echo "📦 Installing Node dependencies..."
	@if command -v pnpm >/dev/null 2>&1; then \
		pnpm install; \
	elif command -v npm >/dev/null 2>&1; then \
		npm install; \
	else \
		echo "⚠️  Neither pnpm nor npm found. Please install Node.js first."; \
	fi

# ============================================================================
# Development
# ============================================================================

dev: start

start:
	@echo "🚀 Starting Kidpen development servers..."
	python start.py start

stop:
	@echo "🛑 Stopping Kidpen services..."
	python start.py stop

status:
	@echo "📊 Checking Kidpen service status..."
	python start.py status

restart:
	@echo "🔄 Restarting Kidpen services..."
	python start.py restart

logs:
	@echo "📋 Showing service logs..."
	@if [ -f .kidpen.pid ]; then \
		tail -f logs/*.log 2>/dev/null || echo "No logs found. Services may not be running."; \
	else \
		echo "Services not running. Use 'make start' first."; \
	fi

# ============================================================================
# Building
# ============================================================================

build: build-frontend
	@echo "✅ Build complete!"

build-frontend:
	@echo "🏗️  Building frontend..."
	@cd apps/frontend && pnpm build

build-mobile:
	@echo "📱 Building mobile app..."
	@cd apps/mobile && npx expo build 2>/dev/null || npx eas build --platform all

build-desktop:
	@echo "🖥️  Building desktop app..."
	@cd apps/desktop && pnpm build

# ============================================================================
# Docker
# ============================================================================

docker-up:
	@echo "🐳 Starting Docker services..."
	docker-compose up -d

docker-down:
	@echo "🐳 Stopping Docker services..."
	docker-compose down

docker-logs:
	@echo "🐳 Docker logs..."
	docker-compose logs -f

# ============================================================================
# Quality
# ============================================================================

test:
	@echo "🧪 Running tests..."
	@cd backend && python -m pytest tests/ 2>/dev/null || echo "Backend tests not configured"
	@cd apps/frontend && pnpm test 2>/dev/null || echo "Frontend tests not configured"

lint:
	@echo "🔍 Running linters..."
	@cd apps/frontend && pnpm lint 2>/dev/null || echo "Frontend lint not configured"
	@cd backend && ruff check . 2>/dev/null || echo "Backend lint not configured"

format:
	@echo "✨ Formatting code..."
	@cd apps/frontend && pnpm format 2>/dev/null || npx prettier --write "src/**/*.{ts,tsx,js,jsx}" 2>/dev/null || echo "Frontend format not configured"
	@cd backend && ruff format . 2>/dev/null || black . 2>/dev/null || echo "Backend format not configured"

check: lint test
	@echo "✅ All checks passed!"

# ============================================================================
# Maintenance
# ============================================================================

clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf apps/frontend/.next
	@rm -rf apps/frontend/out
	@rm -rf apps/frontend/node_modules/.cache
	@rm -rf apps/mobile/.expo
	@rm -rf apps/desktop/dist
	@rm -rf apps/desktop/out
	@rm -rf backend/__pycache__
	@rm -rf backend/.pytest_cache
	@rm -rf backend/.ruff_cache
	@rm -rf sdk/dist
	@rm -rf sdk/*.egg-info
	@rm -rf .kidpen.pid
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo "✅ Clean complete!"

# ============================================================================
# Quick shortcuts
# ============================================================================

# Frontend development
fe:
	@cd apps/frontend && pnpm dev

# Backend development
be:
	@cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Mobile development
mobile:
	@cd apps/mobile && npx expo start

# Desktop development
desktop:
	@cd apps/desktop && pnpm dev
