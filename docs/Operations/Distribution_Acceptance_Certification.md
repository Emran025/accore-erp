---
title: "Accore Distribution Acceptance Certification Matrix"
status: "release-gate"
version: "1.0.0"
last_updated: "2026-08-19"
---

# Accore Distribution Acceptance Certification Matrix

## Release-gate rule

A pilot or production desktop tag is eligible only when every mandatory row below has current evidence from the same immutable source revision. A green compile alone is not certification. Each evidence artifact names the Git revision, operating system target, command outcome, and timestamp; it contains no private signing material, database password, `APP_KEY`, device token, or customer data.

## Clean-device boundary

The reference device image represents an end-user computer: it must not rely on user-installed Node.js, npm, Composer, PHP, MySQL/MariaDB, or a developer-managed database service. The shipped Server package owns its private runtime and data roots; the Client package owns no Server runtime. CI desktop builds on clean hosted runners and the local acceptance procedure must record the absence of external runtime prerequisites before package installation.

| Epic acceptance criterion | Reproducible evidence | Mandatory pass condition |
| --- | --- | --- |
| Signed packages and traceable manifests | `accore-installer-core` manifest and package tests; tag-only release manifest generator | Tampered manifest/package signatures and digests are rejected; server and client manifests include immutable source revision and SHA-256 values. |
| Server and Client product isolation | Desktop matrix builds all Server/Client target configurations; `product-flavor` tests | Server and Client have distinct identifiers/binaries and Client bundles no Server database/API runtime. |
| Clean setup and private runtimes | Desktop package build plus installer cache/package tests | Installer artifacts build without relying on a developer toolchain at target runtime; package verifier rejects untrusted bytes. |
| Trusted pairing and certificate identity | `frontend/tests/lib/client-connection.test.ts`; backend Desktop distribution feature tests | HTTP endpoints, mismatched certificate fingerprints, wrong server identity, revoked device, and incompatible version are denied. |
| Protected Client credentials | `frontend/tests/lib/desktop-credential-vault.test.ts` | Client credentials are stored through the protected vault; Server Desktop never invokes Client-only vault capability. |
| Health before ERP routes | `frontend/tests/lib/server-readiness.test.ts`; Server Agent tests | Server Desktop blocks protected routes while local API health is unavailable and shows failed component plus recommended action. |
| Interrupted install/update | Installer journal recovery tests and release transaction tests | Interrupted or pre-migration failure resumes/rolls back to prior healthy runtime; no release is marked healthy early. |
| Post-migration recovery | `release::post_migration_failure_requires_recovery_and_never_reports_success` | Migration/activation/health failure enters recovery maintenance and ledger never reports success. |
| Backup restore | Server Agent backup supervisor tests and AccoreDB backup validation contract | Backup is exported, restored to isolated validation, integrity-probed, cleaned, and only then marked verified. |
| OS service persistence | Server Agent platform registration tests; package smoke check | Registered service uses system startup and protected local control channel; Server Desktop need not remain open. |
| Support safety and retention | Installer support redaction tests; operational runbook review | Support bundle excludes secrets; backup rotation protects newest points and stale unverified backups are retained for investigation. |

## CI certification procedure

1. Check out the exact pull-request head or release tag.
2. Run the Distribution Rust suite with locked dependencies. This executes package, manifest, journal, release recovery, database runtime, Agent lifecycle, backup verification, retention, and platform registration contracts.
3. Run the frontend test suite and localisation check. This executes pairing, certificate, compatibility, protected-vault, Server readiness, product isolation, and onboarding regressions.
4. Build every Server/Client desktop matrix target. For tags, require the release signing secrets and verify that updater signatures, product-specific updater documents, and signed Accore manifests are published together.
5. Generate and upload a concise acceptance evidence document containing command exit statuses and source revision. If a row is manual or environment-specific, include the controlled procedure and responsible owner; do not silently mark it automated.

## Operator acceptance procedure

The operator records the following after installing the package on the clean reference device:

1. Start **Accore Server** and confirm its operational health surface reports database, API, queue, storage, backup, schema, and Client compatibility status.
2. Pair **Accore Client** using a valid trusted pairing artifact. Repeat with an HTTP endpoint, mismatched certificate fingerprint, revoked device, and outdated Client version; each must be denied before ERP login.
3. Trigger an administrator backup. Verify that the isolated restore evidence is successful and that the backup record remains retained.
4. Exercise an update interruption before migration and a post-migration health failure in the controlled environment. Confirm the release ledger records rollback or recovery maintenance respectively.
5. Reboot the reference device. Confirm the system service restores Server health before opening Server Desktop.
6. Export a support bundle and inspect it only for safe diagnostics; verify literal credentials, tokens, `APP_KEY`, database URLs, and signing material do not appear.

## Evidence retention

Store release-gate evidence with the release record according to the operations retention policy. Evidence references must remain safe for support sharing: use digest, package name, platform, test name, and timestamp. Link failures to the incident record and preserve the release ledger or backup identifier required for investigation.
