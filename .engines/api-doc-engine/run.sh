#!/usr/bin/env bash
# ============================================================
# API Documentation Engine — Entry Point
# Usage:
#   ./engines/api-doc-engine/run.sh              # Full generation
#   ./engines/api-doc-engine/run.sh --dry-run    # Preview only
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../../backend" && pwd)"

if [ ! -f "$BACKEND_DIR/artisan" ]; then
    echo "[ERROR] Laravel backend not found at $BACKEND_DIR"
    exit 1
fi

echo "Running API Documentation Engine..."
php "$BACKEND_DIR/artisan" api-docs:generate "$@"
