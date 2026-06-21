#!/usr/bin/env bash
#
# Production build script — CommerceHub frontend
#
# Usage:
#   chmod +x scripts/build-production.sh
#   ./scripts/build-production.sh
#
# Optional: pass custom env file
#   ENV_FILE=.env.production ./scripts/build-production.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_FILE="${ENV_FILE:-.env.production}"

echo "========================================"
echo "  CommerceHub — Production Build"
echo "========================================"
echo ""

# ── Check prerequisites ──
if ! command -v npm &>/dev/null; then
  echo "Error: npm is not installed or not in PATH." >&2
  exit 1
fi

# ── Ensure production env file ──
if [[ ! -f "$ENV_FILE" ]]; then
  if [[ -f .env.production.example ]]; then
    cp .env.production.example "$ENV_FILE"
    echo "Created $ENV_FILE from .env.production.example"
    echo ">>> Edit $ENV_FILE with your production API URLs before deploying."
    echo ""
  else
    echo "Error: $ENV_FILE not found and no .env.production.example to copy." >&2
    exit 1
  fi
fi

echo "Using env file: $ENV_FILE"
grep -E '^VITE_' "$ENV_FILE" || true
echo ""

# ── Install dependencies ──
echo "==> Installing dependencies..."
if [[ -f package-lock.json ]]; then
  npm ci || npm install
else
  npm install
fi

# ── Build ──
echo ""
echo "==> Building for production..."
npm run build:prod

# ── Done ──
echo ""
echo "========================================"
echo "  Build successful!"
echo "========================================"
echo ""
echo "  Output : $ROOT/dist"
echo "  Deploy : upload everything inside dist/ to your web server"
echo "  Preview: npm run preview:prod"
echo ""
