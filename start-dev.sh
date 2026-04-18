#!/bin/bash
# Quick start script for development - bypasses setup wizard
# Usage: ./start-dev.sh [frontend|backend|all]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

# Create .env from example if it doesn't exist
setup_env() {
  if [ ! -f apps/frontend/.env ]; then
    log_info "Creating frontend .env from example..."
    cp apps/frontend/.env.example apps/frontend/.env
    log_success "Created apps/frontend/.env"
  else
    log_info "Frontend .env already exists"
  fi

  if [ ! -f backend/.env ]; then
    log_info "Creating backend .env..."
    cat > backend/.env << 'EOF'
# Quick start - minimal config
# Add your API keys here
ANTHROPIC_API_KEY=sk-dummy-key
OPENAI_API_KEY=sk-dummy-key
SUPABASE_URL=https://ujzsbwvurfyeuerxxeaz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqenNid3Z1cmZ5ZXVlcnh4ZWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MDQwMzUsImV4cCI6MjA4NDQ4MDAzNX0.-yXpKNQphoh5F4MSPxVkW1P63Ow7jZvHgFppS2KMfWc
KIDPEN_ADMIN_API_KEY=dev-admin-key
KIDPEN_API_KEY=dev-api-key
EOF
    log_success "Created backend/.env"
  else
    log_info "Backend .env already exists"
  fi
}

# Mark setup as complete
mark_setup_complete() {
  if [ ! -f .setup_progress ] || ! grep -q '"setup_method"' .setup_progress 2>/dev/null; then
    log_info "Creating setup progress file..."
    cat > .setup_progress << 'EOF'
{
  "current_step": 16,
  "total_steps": 16,
  "started_at": "2026-04-18T00:00:00",
  "last_updated": "2026-04-18T00:00:00",
  "setup_method": "manual",
  "data": {
    "setup_method": "manual",
    "supabase_setup_method": "cloud"
  },
  "steps": {}
}
EOF
    log_success "Setup marked as complete"
  fi
}

# Start frontend
start_frontend() {
  log_info "Starting frontend..."
  cd apps/frontend
  
  # Check if already running
  if lsof -i:3000 >/dev/null 2>&1; then
    log_warn "Frontend already running on port 3000"
    return 0
  fi
  
  pnpm dev &
  log_success "Frontend started on http://localhost:3000"
  cd "$SCRIPT_DIR"
}

# Start backend
start_backend() {
  log_info "Starting backend..."
  
  # Check if already running
  if lsof -i:8000 >/dev/null 2>&1; then
    log_warn "Backend already running on port 8000"
    return 0
  fi
  
  cd backend
  python api.py &
  log_success "Backend started on http://localhost:8000"
  cd "$SCRIPT_DIR"
}

# Main
main() {
  echo -e "${GREEN}"
  echo "╔═══════════════════════════════════════╗"
  echo "║    Kidpen Quick Start (Dev Mode)      ║"
  echo "╚═══════════════════════════════════════╝"
  echo -e "${NC}"
  
  # Setup environment
  setup_env
  mark_setup_complete
  
  MODE="${1:-all}"
  
  case "$MODE" in
    frontend)
      start_frontend
      ;;
    backend)
      start_backend
      ;;
    all)
      start_backend
      sleep 2
      start_frontend
      echo ""
      log_success "All services started!"
      echo "  Frontend: http://localhost:3000"
      echo "  Backend:  http://localhost:8000"
      ;;
    *)
      echo "Usage: $0 [frontend|backend|all]"
      exit 1
      ;;
  esac
  
  echo ""
  log_info "Press Ctrl+C to stop..."
  
  # Wait for signals
  wait
}

main "$@"