#!/bin/bash
# Simple start script that starts frontend only (backend has dependency issues)
# For full stack, you need to run the setup wizard with real credentials

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Create .env from example if it doesn't exist
setup_env() {
  if [ ! -f apps/frontend/.env ]; then
    log_info "Creating frontend .env from example..."
    cp apps/frontend/.env.example apps/frontend/.env
    log_success "Created apps/frontend/.env"
  else
    log_info "Frontend .env already exists"
  fi
}

# Start frontend only
start_frontend() {
  log_info "Starting frontend..."
  cd apps/frontend
  
  # Check if already running
  if lsof -i:3000 >/dev/null 2>&1; then
    log_warn "Frontend already running on port 3000"
    return 0
  fi
  
  pnpm dev &
  cd "$SCRIPT_DIR"
}

main() {
  echo -e "${GREEN}"
  echo "╔════════════════════════════════════════════════════════╗"
  echo "║     Kidpen Frontend Only (Development Mode)            ║"
  echo "╚════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
  
  setup_env
  
  log_info "Note: Backend requires full setup with valid Supabase credentials"
  log_info "Starting frontend only..."
  echo ""
  
  start_frontend
  
  sleep 5
  
  echo ""
  log_success "=================================================="
  log_success "Frontend running at: http://localhost:3000"
  log_success "=================================================="
  echo ""
  log_info "Backend requires setup wizard with valid credentials"
  log_info "Press Ctrl+C to stop..."
  
  wait
}

main "$@"