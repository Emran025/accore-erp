#!/bin/bash
# verify-output-structure.sh — Validates that a generated document matches its template
# Usage: ./verify-output-structure.sh <doc-file> <template-name>
#
# Checks:
# 1. YAML frontmatter exists and contains required fields
# 2. All template sections are present (H2/H3 headings)
# 3. No external image references (PNG/JPG)
# 4. Assumption markers are properly formatted

set -euo pipefail

DOC_FILE="${1:?Usage: verify-output-structure.sh <doc-file> <template-name>}"
TEMPLATE_NAME="${2:?Missing template name}"

TEMPLATE_DIR="$(dirname "$0")/../templates"
TEMPLATE_FILE="$TEMPLATE_DIR/$TEMPLATE_NAME.template.md"

if [[ ! -f "$TEMPLATE_FILE" ]]; then
    echo "ERROR: Template not found: $TEMPLATE_FILE"
    exit 1
fi

ERRORS=0

# Check frontmatter exists
if ! head -1 "$DOC_FILE" | grep -q "^---$"; then
    echo "ERROR: Missing YAML frontmatter"
    ERRORS=$((ERRORS + 1))
fi

# Check required frontmatter fields
for FIELD in "title:" "domain:" "tier:" "status:" "task_id:" "template:" "word_count:"; do
    if ! grep -q "$FIELD" "$DOC_FILE"; then
        echo "ERROR: Missing frontmatter field: $FIELD"
        ERRORS=$((ERRORS + 1))
    fi
done

# Extract required section headings from template and validate against document
# Template sections are marked as ### N. `Section Name`
while IFS= read -r HEADING; do
    # Extract the section name from template heading format
    SECTION_NAME=$(echo "$HEADING" | sed 's/^### [0-9]*\. `\(.*\)`$/\1/' | sed 's/^## //')
    if [[ -n "$SECTION_NAME" ]] && ! grep -q "$SECTION_NAME" "$DOC_FILE"; then
        echo "ERROR: Missing required section: $SECTION_NAME"
        ERRORS=$((ERRORS + 1))
    fi
done < <(grep -E "^###? [0-9]" "$TEMPLATE_FILE" 2>/dev/null || true)

# Check for forbidden image references
if grep -qiE '\.(png|jpg|jpeg|gif|bmp|svg)' "$DOC_FILE"; then
    echo "WARNING: Possible external image reference detected. Only Mermaid diagrams are allowed."
fi

# Check for assumption markers
ASSUMPTION_COUNT=$(grep -c '\[ASSUMPTION\]' "$DOC_FILE" 2>/dev/null || echo "0")
if [[ $ASSUMPTION_COUNT -gt 0 ]]; then
    echo "INFO: $ASSUMPTION_COUNT assumption markers found — requires human review"
fi

if [[ $ERRORS -gt 0 ]]; then
    echo "FAILED: $ERRORS errors in $DOC_FILE"
    exit 1
else
    echo "PASSED: $DOC_FILE conforms to template '$TEMPLATE_NAME'"
fi

