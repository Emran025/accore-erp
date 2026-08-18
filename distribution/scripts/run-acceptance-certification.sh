#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EVIDENCE_DIR="${ACCORE_ACCEPTANCE_EVIDENCE_DIR:-$ROOT/acceptance-evidence}"
REVISION="${GITHUB_SHA:-$(git -C "$ROOT" rev-parse HEAD)}"
TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
mkdir -p "$EVIDENCE_DIR"
EVIDENCE_FILE="$EVIDENCE_DIR/distribution-acceptance.md"

run_gate() {
  local name="$1"
  shift
  printf 'Running %s\n' "$name"
  "$@"
  printf '| %s | passed |\n' "$name" >> "$EVIDENCE_FILE"
}

cat > "$EVIDENCE_FILE" <<EOF
# Accore Distribution Acceptance Evidence

| Field | Value |
| --- | --- |
| Source revision | $REVISION |
| Generated at | $TIMESTAMP |
| Runner | ${RUNNER_OS:-local} |

## Automated gates

| Gate | Outcome |
| --- | --- |
EOF

run_gate 'Installer contracts: signed package, tamper rejection, interruption, release recovery, support redaction' \
  bash -lc "cd '$ROOT/distribution/crates/accore-installer-core' && cargo test --locked"
run_gate 'AccoreDB contracts: private layout and isolated restore validation' \
  bash -lc "cd '$ROOT/distribution/crates/accoredb-runtime' && cargo test --locked"
run_gate 'Server Agent contracts: startup, restart, backup verification, retention, local service registration' \
  bash -lc "cd '$ROOT/distribution/crates/accore-server-agent' && cargo test --locked"
run_gate 'Client pairing and Server readiness contracts' \
  bash -lc "cd '$ROOT/frontend' && npm test -- tests/lib/client-connection.test.ts tests/lib/desktop-credential-vault.test.ts tests/lib/server-readiness.test.ts"
run_gate 'Localized operations interface inventory' \
  bash -lc "cd '$ROOT/frontend' && npm run i18n:check"

cat >> "$EVIDENCE_FILE" <<'EOF'

## Controlled environment follow-up

The release operator must attach the clean-device, reboot persistence, and package-installation procedure outcomes described in `docs/Operations/Distribution_Acceptance_Certification.md`. This environment-specific evidence cannot be inferred from a hosted CI runner and must never include secrets or customer data.
EOF

printf 'Acceptance evidence written to %s\n' "$EVIDENCE_FILE"
