#!/bin/bash
# update-execution-log.sh — Appends a new entry to the execution log
# Usage: ./update-execution-log.sh <task_id> <word_count> <output_path> <status>
#
# Automatically captures timestamp and git commit hash

set -euo pipefail

TASK_ID="${1:?Usage: update-execution-log.sh <task_id> <word_count> <output_path> <status>}"
WORD_COUNT="${2:?Missing word_count}"
OUTPUT_PATH="${3:?Missing output_path}"
STATUS="${4:?Missing status (completed|needs_verification|failed)}"

LOG_FILE="$(dirname "$0")/../logs/execution-log.csv"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
EXECUTOR="${DOC_ENGINE_EXECUTOR:-ai-agent}"

echo "$TASK_ID,$TIMESTAMP,$WORD_COUNT,$COMMIT_HASH,$OUTPUT_PATH,$STATUS,$EXECUTOR" >> "$LOG_FILE"

echo "Logged: $TASK_ID ($STATUS) — $WORD_COUNT words at $COMMIT_HASH"
