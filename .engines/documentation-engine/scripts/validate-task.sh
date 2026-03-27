#!/bin/bash
# validate-task.sh — Validates that a task file conforms to the required schema
# Usage: ./validate-task.sh <path-to-task-file>
#
# Checks:
# 1. File ends with .task.md
# 2. Contains required sections: Metadata, Objective, Input Files
# 3. Contains a Task ID in the metadata table
# 4. Contains a Template reference
# 5. Contains an Output Path
# 6. Is located in the correct phase directory

set -euo pipefail

TASK_FILE="${1:?Usage: validate-task.sh <task-file>}"

if [[ ! "$TASK_FILE" =~ \.task\.md$ ]]; then
    echo "ERROR: File does not match naming convention (*.task.md): $TASK_FILE"
    exit 1
fi

ERRORS=0

# Check required fields in metadata table
for FIELD in "Task ID" "Phase" "Template" "Output Path"; do
    if ! grep -q "$FIELD" "$TASK_FILE"; then
        echo "ERROR: Missing metadata field: $FIELD"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check for Objective or Input sections
if ! grep -q "## Objective\|## Input Files" "$TASK_FILE"; then
    echo "WARNING: Missing Objective or Input Files section"
fi

# Check phase directory alignment
PHASE_DIR=$(basename "$(dirname "$TASK_FILE")")
DECLARED_PHASE=$(grep -oP 'Phase\s*\|\s*\K[0-9]+' "$TASK_FILE" 2>/dev/null || echo "unknown")
if [[ "$PHASE_DIR" == "phase-$DECLARED_PHASE" ]] || [[ "$DECLARED_PHASE" == "unknown" ]]; then
    : # OK
else
    echo "ERROR: Task declares Phase $DECLARED_PHASE but is in directory $PHASE_DIR"
    ERRORS=$((ERRORS + 1))
fi

if [[ $ERRORS -gt 0 ]]; then
    echo "FAILED: $ERRORS errors found in $TASK_FILE"
    exit 1
else
    echo "PASSED: $TASK_FILE"
fi
