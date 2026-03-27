#!/bin/bash
# check-word-count.sh — Enforces the ≤650 word ceiling on documentation output
# Usage: ./check-word-count.sh <path-to-doc-file>
#
# Counts only body text (excludes YAML frontmatter, Mermaid code blocks, table syntax)

set -euo pipefail

DOC_FILE="${1:?Usage: check-word-count.sh <doc-file>}"

if [[ ! -f "$DOC_FILE" ]]; then
    echo "ERROR: File not found: $DOC_FILE"
    exit 1
fi

# Remove frontmatter (between --- markers)
# Remove Mermaid code blocks
# Remove table separator lines (|---|---|)
# Count remaining words
WORD_COUNT=$(sed '/^---$/,/^---$/d' "$DOC_FILE" \
    | sed '/^```mermaid$/,/^```$/d' \
    | sed '/^```/,/^```$/d' \
    | grep -v '^|[-|: ]*|$' \
    | wc -w)

MIN_WORDS=400
MAX_WORDS=650

echo "Word count for $(basename "$DOC_FILE"): $WORD_COUNT"

if [[ $WORD_COUNT -lt $MIN_WORDS ]]; then
    echo "WARNING: Below minimum ($MIN_WORDS words). Content may be too shallow."
    exit 1
elif [[ $WORD_COUNT -gt $MAX_WORDS ]]; then
    echo "ERROR: Exceeds maximum ($MAX_WORDS words). Must split or condense."
    exit 1
else
    echo "PASSED: Word count within range [$MIN_WORDS, $MAX_WORDS]"
fi
