---
title: "Accore Server and Client Distribution - GitHub Issue Hierarchy"
domain: "Operations"
tier: 5
status: "ready-for-triage"
source_revision: "8ddbe38ac0e4629254909319e7c1d9613a9a5325"
---

# Accore Server and Client Distribution - GitHub Issue Hierarchy

## Operating Model

This document is the publish-ready issue hierarchy for the **Accore Server and Client Distribution Architecture**. Create the epic first, then create the child issues in the order listed below. Once GitHub assigns issue numbers, replace every `#TBD-XX` placeholder in the epic and child issue bodies with the real issue reference.

Every child issue must include the line **`Parent epic: #<EPIC_NUMBER>`** in its body. The epic must maintain the child checklist. The child issue is not complete until its acceptance criteria, automated tests, documentation updates, and security review requirements have been satisfied.

| Label | Meaning |
|---|---|
| `type:epic` | Cross-release parent issue |
| `type:architecture` | Decision or boundary design work |
| `type:feature` | Product capability |
| `type:security` | Security-sensitive work requiring focused review |
| `type:installer` | Installer, package, runtime, or OS integration work |
| `type:backend` | Laravel/API/database change |
| `type:desktop` | Tauri/Next.js desktop change |
| `type:release` | Build, signing, updater, or delivery pipeline |
| `type:operations` | Service, backup, health, recovery, or runbook work |
| `priority:critical` | Must be complete before pilot deployment |
| `priority:high` | Required for production readiness |
| `platform:windows` | Windows reference implementation |
| `platform:cross-platform` | Design must remain portable across Windows, macOS, and Linux |

---

# Main Issue (Create First)

## `[EPIC] Deliver self-contained Accore Server and Accore Client distribution`

**Labels:** `type:epic`, `priority:critical`, `platform:cross-platform`
**Milestone:** `Accore Self-Contained Distribution`
**Parent epic:** None

### Problem Statement

Accore ERP currently has separate Laravel and Next.js/Tauri source components. Local development starts frontend, API, queue, and asset processes independently, while MySQL remains an external prerequisite. The desktop Tauri configuration packages the exported frontend but does not package or supervise the Laravel API, database, queue worker, installer workflow, or client-to-server trust model.[1] [2] [3]

The product needs an end-user distribution model in which customers do not install or manage Node.js, npm, Composer, PHP, Rust, Cargo, or a pre-existing MySQL service. It must support a primary machine that runs both the ERP UI and the organisation server, as well as client workstations that connect over LAN or the Internet only after successful server verification and device enrolment.

### Objective

Deliver two signed, independently installable product flavours from one codebase:

1. **Accore Server**: a primary-machine product that installs and supervises a local API runtime, database runtime, queue processing, persistent storage, update workflow, and the same ERP desktop interface.
2. **Accore Client**: a workstation product that installs only the ERP interface and required client runtime, enforces a trusted server connection gate, securely stores client connection credentials, and never contains database or Laravel server components.

### Architectural Guardrails

| Guardrail | Requirement |
|---|---|
| Single source of truth | Both product flavours share the existing frontend and backend domain code; no duplicated ERP codebase |
| Service ownership | A dedicated Server Agent, not a desktop UI window, owns database/API/queue lifecycle |
| Data boundary | Database binds to loopback only; clients use HTTPS API only |
| End-user isolation | No developer toolchain is required on customer devices |
| Package trust | Every downloaded/imported runtime package is signed and SHA-256 verified before use |
| Data durability | Database, Laravel storage, secrets, logs, and backups are outside replaceable application directories |
| Client access gate | Client cannot enter protected ERP screens before endpoint, TLS, server identity, compatibility, and enrolment checks pass |
| Update safety | Server migrations run once through the Server Agent after a consistent backup checkpoint; clients never run migrations |
| Security baseline | No production MySQL root account, no persisted access token in browser storage, no arbitrary shell execution from React |

### Child Issue Checklist

- [ ] #TBD-01 `ADR: approve platform, database-runtime, TLS, and lifecycle decisions`
- [ ] #TBD-02 `Define signed distribution manifest, artifact format, and content-addressable runtime store`
- [ ] #TBD-03 `Introduce Server and Client Tauri product flavours from the shared frontend`
- [ ] #TBD-04 `Build the cross-platform installer core with verified download, offline import, progress, and recovery journal`
- [ ] #TBD-05 `Implement Accore Server Agent as the local service supervisor`
- [ ] #TBD-06 `Package and operate a private AccoreDB runtime`
- [ ] #TBD-07 `Package Laravel as a standalone Accore API runtime`
- [ ] #TBD-08 `Implement server installation, upgrade, health, backup, and maintenance Artisan operations`
- [ ] #TBD-09 `Build Server first-run onboarding and local server administration experience`
- [ ] #TBD-10 `Implement desktop bootstrap, enrolment, device registry, and compatibility APIs`
- [ ] #TBD-11 `Build Client Connection Gate, trusted server profiles, and pairing UX`
- [ ] #TBD-12 `Replace persisted browser tokens with encrypted desktop credential storage`
- [ ] #TBD-13 `Produce Server and Client online, offline, and importable installation artifacts`
- [ ] #TBD-14 `Build signed release, update, rollback, and compatibility pipeline`
- [ ] #TBD-15 `Add operational observability, backup verification, and support runbooks`
- [ ] #TBD-16 `Automate installation, pairing, upgrade, security, and recovery acceptance testing`

### Epic Acceptance Criteria

- A clean reference target can install Accore Server without Node.js, npm, Composer, PHP, or a pre-installed database server.
- Server Desktop opens the same ERP interface only after local Server Agent and API health are verified.
- Closing Server Desktop does not stop healthy server services by default.
- A clean Client target can install Accore Client without server tooling, pair through a server-approved method, and sign in only after trust checks pass.
- Clients cannot connect to the database directly or bypass the connection gate.
- Online, offline, and pre-downloaded-package installation paths verify the same signed artifacts.
- An interrupted installation and an interrupted release update are recoverable through a durable journal and documented procedure.
- A server release creates a backup checkpoint before database migration, runs migrations once, and records outcome in a release ledger.
- Release artifacts and in-app updates are signed; no private signing key is committed to the repository.
- All acceptance tests in #TBD-16 pass for the supported reference platform before pilot deployment.

### Exclusions

This epic does not introduce general offline-first ERP data synchronisation, multi-master database replication, or arbitrary third-party plugin execution. Those are separate product initiatives and must not be silently introduced by the installer work.

---

# Child Issues

## #TBD-01 — `[ADR] Approve platform, database-runtime, TLS, and lifecycle decisions`

**Labels:** `type:architecture`, `type:security`, `priority:critical`, `platform:cross-platform`
**Parent epic:** `#<EPIC_NUMBER>`
**Dependencies:** None
**Blocks:** #TBD-05, #TBD-06, #TBD-07, #TBD-13, #TBD-14

### Goal

Create and approve the non-negotiable architecture decisions that determine what can be safely built and distributed. No runtime implementation begins before these decisions are approved.

### Scope

- Select the initial supported OS and architecture. The recommended reference target is Windows x64 if it reflects the first customer environment.
- Select a legally distributable and operationally supportable MySQL-compatible runtime for AccoreDB.
- Define the Server Agent’s operating-system service model for Windows, macOS, and Linux.
- Define the default lifecycle: always-on LAN server, optional single-workstation mode, shutdown order, and restart policy.
- Define the LAN certificate model, Internet/DNS/TLS prerequisites, certificate pinning behaviour, and firewall policy.
- Define code-signing, manifest-signing, package-signing, and private-key custody requirements.
- Define the backup-retention, restore, and migration failure policy.
- Define product activation behaviour separately from user authentication.

### Deliverables

- `docs/Architecture/ADR/ADR-XXX-accore-distribution-platform.md`
- `docs/Architecture/ADR/ADR-XXX-accoredb-runtime.md`
- `docs/Architecture/ADR/ADR-XXX-tls-and-pairing-trust.md`
- `docs/Operations/Server_Lifecycle_and_Recovery_Policy.md`

### Acceptance Criteria

- Each decision records context, options, selected option, consequences, security implications, rollback implications, and owner approval.
- The database runtime decision includes license review, target-platform packaging method, data-directory layout, supported upgrade path, and backup compatibility.
- The TLS decision explicitly covers local-only, LAN, and Internet deployments.
- The lifecycle decision explicitly states what happens at UI close, OS reboot, database failure, API failure, and an administrative shutdown.
- The result is reviewed by backend, desktop, security, and operations owners.

---

## #TBD-02 — `[Distribution] Define signed manifest, artifact format, and content-addressable runtime store`

**Labels:** `type:architecture`, `type:installer`, `type:security`, `priority:critical`, `platform:cross-platform`
**Parent epic:** `#<EPIC_NUMBER>`
**Dependencies:** #TBD-01
**Blocks:** #TBD-04, #TBD-13, #TBD-14

### Goal

Define a single trusted artifact contract used by Server Setup, Client Setup, full offline installers, standalone importable packages, and update services.

### Scope

- Define `accorepkg` container format and signed release manifest JSON schema.
- Define product, version, platform, architecture, API contract, schema compatibility, size, URL, SHA-256, signature, and dependency fields.
- Implement a content-addressable store rooted at `ACCORERUNTIME_HOME/cache/objects/sha256/`.
- Implement atomic import/promotion, per-object locks, partial-download resume, package reference tracking, and safe garbage collection.
- Define online bootstrapper, full offline installer, and manually imported-package behaviours.

### Implementation Notes

Create `distribution/manifests/schema/release-manifest.schema.json` and Rust crates under `distribution/crates/accore-installer-core/` for `manifest`, `download`, `cache`, and `journal` modules. The content store must never contain business data, customer secrets, or database files.

### Acceptance Criteria

- A schema validator rejects missing digest, invalid version, unknown platform, unsigned manifest, and malformed compatibility data.
- A tampered artifact is rejected before extraction or activation.
- Two concurrent installers cannot download/promote the same object twice or corrupt it.
- A partial download is resumable and produces the same verified object as a complete download.
- A valid externally downloaded `accorepkg` can be imported without network access.
- A referenced artifact is not garbage-collected; unreferenced stale objects can be reclaimed safely.

---

## #TBD-03 — `[Desktop] Introduce Server and Client Tauri product flavours from the shared frontend`

**Labels:** `type:desktop`, `type:feature`, `priority:critical`, `platform:cross-platform`
**Parent epic:** `#<EPIC_NUMBER>`
**Dependencies:** #TBD-01
**Blocks:** #TBD-09, #TBD-11, #TBD-13, #TBD-14

### Goal

Produce `Accore Server` and `Accore Client` desktop applications from the existing Next.js/Tauri source without duplicating ERP screens or domain logic.

### Scope

- Add a base Tauri configuration plus `tauri.server.conf.json` and `tauri.client.conf.json`.
- Add product-specific application identifiers, names, updater configuration, capabilities, CSP, and icons.
- Add a compile-time UI flavour variable for presentation only; enforce privileged capabilities through separate packages and capabilities, not frontend conditionals.
- Add package scripts for frontend build, Server Tauri build, Client Tauri build, and release artifact creation.
- Remove production dependence on the current implicit API fallback behaviour.[5]

### Files Expected

- `frontend/src-tauri/tauri.server.conf.json`
- `frontend/src-tauri/tauri.client.conf.json`
- `frontend/src-tauri/capabilities/server.json`
- `frontend/src-tauri/capabilities/client.json`
- `frontend/src-tauri/src/commands.rs`
- `frontend/package.json`

### Acceptance Criteria

- Server and Client builds have distinct bundle identifiers, product names, and update channels.
- Client build does not contain Server Agent binaries or server-control capabilities.
- Server build exposes only a minimal, authenticated local server-control surface.
- Both builds load the same ERP UI source and static assets.
- Release configuration has a non-null CSP and permits only approved origins.
- Production build contains no `http://127.0.0.1:8000/api` fallback for Client mode.

---

## #TBD-04 — `[Installer] Build cross-platform installer core with verified download, offline import, progress, and recovery journal`

**Labels:** `type:installer`, `type:feature`, `type:security`, `priority:critical`, `platform:cross-platform`
**Parent epic:** `#<EPIC_NUMBER>`
**Dependencies:** #TBD-02
**Blocks:** #TBD-09, #TBD-13, #TBD-16

### Goal

Implement the reusable installation engine used by both Server Setup and Client Setup, with transparent progress, offline import, integrity verification, and durable recovery.

### Scope

- Build a small Tauri setup UI backed by Rust installation core.
- Emit structured events for stage, artifact byte progress, digest/signature verification, service state, migration state, warning, and recoverable failure.
- Create a durable installation journal with stage boundaries and idempotent resume/rollback decisions.
- Implement system/user installation-path selection and safe permission checks.
- Generate a redacted support bundle on failure.

### Acceptance Criteria

- The setup UI displays aggregate and per-artifact byte progress sourced from Rust events.
- Interrupting at download, verification, extraction, service registration, or first-run setup leads to a deterministic resume or safe rollback decision.
- The installer does not claim success before service/API health checks pass.
- Imported packages follow exactly the same signature and digest validation as downloaded packages.
- Failure support bundles redact secrets, tokens, and database credentials.

---

## #TBD-05 — `[Server] Implement Accore Server Agent as the local service supervisor`

**Labels:** `type:installer`, `type:operations`, `type:security`, `priority:critical`, `platform:cross-platform`
**Parent epic:** `#<EPIC_NUMBER>`
**Dependencies:** #TBD-01, #TBD-02
**Blocks:** #TBD-06, #TBD-07, #TBD-08, #TBD-09, #TBD-14, #TBD-15

### Goal

Create the native service that owns AccoreDB, API runtime, queue lifecycle, health monitoring, maintenance mode, controlled shutdown, and update coordination.

### Scope

- Build `distribution/crates/accore-server-agent/` as a native Rust service.
- Implement Windows Service Control Manager, macOS `launchd`, and Linux `systemd` adapters behind a common interface.
- Start components in order: database readiness, API runtime, queue worker, health publishing.
- Implement bounded restart and backoff policy.
- Expose only an ACL-protected local management channel: named pipe on Windows and Unix domain socket on macOS/Linux.
- Implement status, maintenance, graceful shutdown, diagnostic collection, and version reporting operations.

### Acceptance Criteria

- Agent starts automatically on OS boot and survives Server Desktop closure.
- Database failure prevents dependent API serving and produces an actionable unhealthy status.
- API failure is restarted within configured bounds without stopping the database.
- An unauthorised local user cannot issue lifecycle commands through the management channel.
- Administrative shutdown drains/stops queue processing, stops API, then stops database in order.
- Service logs are rotated and stored outside executable directories.

---

## #TBD-06 — `[Runtime] Package and operate a private AccoreDB runtime`

**Labels:** `type:installer`, `type:operations`, `type:security`, `priority:critical`, `platform:cross-platform`
**Parent epic:** `#<EPIC_NUMBER>`
**Dependencies:** #TBD-01, #TBD-05
**Blocks:** #TBD-07, #TBD-08, #TBD-09, #TBD-16

### Goal

Integrate the approved MySQL-compatible database runtime as a private, supervised Accore component with durable data, least-privilege accounts, and no direct client exposure.

### Scope

- Package the selected runtime per platform according to ADR #TBD-01.
- Initialise a data directory outside replaceable runtime directories.
- Generate service-owned database credentials and create dedicated Accore application accounts.
- Bind database network access to loopback only.
- Implement readiness, backup, shutdown, runtime upgrade, storage-capacity, and corruption-diagnostic procedures.
- Define a compatibility matrix for database runtime upgrades and backup restore.

### Acceptance Criteria

- A clean target can initialise AccoreDB without pre-installed MySQL/MariaDB.
- Laravel connects through a dedicated least-privilege account; production never uses root.
- Remote LAN/Internet connections to the database port are rejected.
- Data persists across Server Desktop closure, API restart, Agent restart, and binary runtime update.
- Backup can be restored into an isolated validation instance using the documented procedure.
- Database runtime upgrade is blocked if compatibility preflight fails.

---

## #TBD-07 — `[Runtime] Package Laravel as a standalone Accore API runtime`

**Labels:** `type:backend`, `type:installer`, `type:operations`, `priority:critical`, `platform:cross-platform`
**Parent epic:** `#<EPIC_NUMBER>`
**Dependencies:** #TBD-01, #TBD-05, #TBD-06
**Blocks:** #TBD-08, #TBD-09, #TBD-10, #TBD-16

### Goal

Produce and operate a Laravel API runtime that needs no user-installed PHP, Composer, Node.js, npm, or standalone web server.

### Scope

- Build the Laravel application with production Composer dependencies and required PHP extensions into a self-contained FrankenPHP runtime.
- Include `pdo_mysql` and every extension required by the committed backend dependency set.
- Provide controlled Caddy/FrankenPHP configuration for local, LAN, and Internet operating modes.
- Set `LARAVEL_STORAGE_PATH` to the durable Accore runtime home.
- Provide embedded CLI invocation for Artisan commands and health checks.
- Replace development-server assumptions (`php artisan serve`) in production paths.

### Acceptance Criteria

- API starts on a clean reference target with no PHP, Composer, Node.js, or npm installed.
- The runtime serves the existing Laravel API successfully and passes `/up` plus Accore runtime health checks.
- Logs, uploads, caches, and sessions are persisted outside the versioned binary directory.
- Required PHP extension check fails early with a clear diagnostic during release verification.
- The Server Agent can start, stop, and invoke allow-listed Artisan operations through the packaged runtime.

---

## #TBD-08 — `[Backend] Implement server installation, upgrade, health, backup, and maintenance Artisan operations`

**Labels:** `type:backend`, `type:operations`, `type:security`, `priority:critical`, `platform:cross-platform`
**Parent epic:** `#<EPIC_NUMBER>`
**Dependencies:** #TBD-05, #TBD-06, #TBD-07
**Blocks:** #TBD-09, #TBD-14, #TBD-15, #TBD-16

### Goal

Make first-run and update behaviour explicit, locked, idempotent, auditable, and usable only by the Server Agent or authorised server administration flow.

### Scope

- Add `accore:install`, `accore:upgrade`, `accore:runtime:health`, `accore:enrollment:create`, and `accore:maintenance` commands.
- Add `installations`, `release_ledger`, `schema_checkpoints`, `client_devices`, and `enrollment_codes` migrations/models as appropriate.
- Enforce installation/update locks.
- Implement preflight, backup checkpoint registration, migration ledger, post-flight health, and failure state recording.
- Enforce `APP_ENV=production`, `APP_DEBUG=false`, non-root DB credentials, and production cache optimisation.

### Acceptance Criteria

- A second invocation of initialisation cannot reset or overwrite an existing customer database.
- Only one migration/upgrade transaction can execute at a time.
- Each release ledger record includes release digest, schema before/after, time, result, initiating identity, and backup reference.
- Health command returns machine-readable non-secret diagnostics for database, cache, queue, disk, and schema status.
- An upgrade failure preserves a supportable state and never falsely reports a completed release.

---

## #TBD-09 — `[Server Desktop] Build first-run onboarding and local server administration experience`

**Labels:** `type:desktop`, `type:feature`, `type:installer`, `priority:high`, `platform:cross-platform`
**Parent epic:** `#<EPIC_NUMBER>`
**Dependencies:** #TBD-03, #TBD-04, #TBD-05, #TBD-06, #TBD-07, #TBD-08
**Blocks:** #TBD-10, #TBD-13, #TBD-16

### Goal

Provide the primary-machine experience: startup readiness, first organisation setup, first administrator creation, network-mode configuration, server status, and pairing material generation.

### Scope

- Add a Server Desktop startup state that waits for Agent/API readiness before ERP routes open.
- Build first-run organisation wizard: organisation identity, locale, administrator account, network mode, and confirmation summary.
- Build server-status view: components, versions, health, disk, backup status, and support-bundle entry point.
- Build pairing-code/QR creation and revocation UI for authorised administrators.
- Expose only authorised server-management commands through the local Agent channel.

### Acceptance Criteria

- Server Desktop cannot show authenticated ERP content while local Server Agent/API health is failing.
- The wizard creates an administrator through Laravel hashing flow and never writes its password to setup logs/configuration.
- Closing Server Desktop leaves Server Agent and healthy server services running by default.
- Server administration actions require a verified administrative session and are audit logged.
- Generated QR/pairing data contains no database credential, application key, or long-lived user token.

---

## #TBD-10 — `[Backend] Implement desktop bootstrap, enrolment, device registry, and compatibility APIs`

**Labels:** `type:backend`, `type:feature`, `type:security`, `priority:critical`, `platform:cross-platform`
**Parent epic:** `#<EPIC_NUMBER>`
**Dependencies:** #TBD-07, #TBD-08, #TBD-09
**Blocks:** #TBD-11, #TBD-12, #TBD-14, #TBD-16

### Goal

Add the narrow API surface that lets clients verify a server, enrol as approved devices, receive policy, and negotiate release compatibility without exposing ERP data or server secrets.

### Scope

- Add `GET /api/v1/desktop/bootstrap` with rate limiting and a minimal non-sensitive response.
- Add `POST /api/v1/desktop/enroll` that consumes short-lived one-time pairing evidence.
- Add `GET /api/v1/desktop/policy` for enrolled/authenticated client policy.
- Implement server identity, API contract, minimum-client-version, enrolment mode, certificate binding metadata, and device revocation behaviour.
- Add audit events and tests for bootstrap, enrolment, replay, expiry, revocation, and rate limiting.

### Acceptance Criteria

- Bootstrap response contains no customer financial data, usernames, database configuration, or server secret.
- An expired or already consumed pairing code is rejected.
- A revoked device cannot obtain policy or refresh credentials.
- Client compatibility below the required version receives a deterministic update-required response.
- All routes are protected by explicit rate limits and audit logging.

---

## #TBD-11 — `[Client Desktop] Build Connection Gate, trusted server profiles, and pairing UX`

**Labels:** `type:desktop`, `type:feature`, `type:security`, `priority:critical`, `platform:cross-platform`
**Parent epic:** `#<EPIC_NUMBER>`
**Dependencies:** #TBD-03, #TBD-10
**Blocks:** #TBD-12, #TBD-13, #TBD-16

### Goal

Prevent Accore Client from entering ERP screens until it is paired with a healthy, compatible, trusted Accore Server.

### Scope

- Add `app/connection/`, `lib/connection/`, and `useConnectionStore.ts`.
- Implement QR scan/import, pairing-file import, and manual HTTPS endpoint flows.
- Validate endpoint availability, TLS, server identity, certificate binding, API compatibility, and enrolment response.
- Persist public server-profile data separately from encrypted credentials.
- Replace the current production API base fallback with resolved profile endpoint logic.
- Add offline/error/retry/update-required views; do not silently render stale business data as current.

### Acceptance Criteria

- First launch displays only Connection Gate until a server profile passes all required checks.
- Client rejects HTTP production endpoints, untrusted certificates, server-identity mismatch, and incompatible server versions.
- Manual endpoint, QR, and pairing-file paths converge on the same trust-validation code.
- A healthy paired client reaches the normal login flow and existing ERP routes.
- Removing/revoking a profile clears confidential connection credentials and returns the user to Connection Gate.

---

## #TBD-12 — `[Security] Replace persisted browser tokens with encrypted desktop credential storage`

**Labels:** `type:desktop`, `type:security`, `priority:critical`, `platform:cross-platform`
**Parent epic:** `#<EPIC_NUMBER>`
**Dependencies:** #TBD-10, #TBD-11
**Blocks:** #TBD-16

### Goal

Replace current Zustand/browser-localStorage persistence of `sessionToken` with a desktop-appropriate session model based on short-lived access tokens and encrypted, revocable credentials.

### Scope

- Integrate `@tauri-apps/plugin-stronghold` and Rust plugin configuration.
- Define in-memory access token, protected refresh token, device credential, and public server-profile data boundaries.
- Refactor `frontend/stores/useAuthStore.ts` to remove sensitive persisted Zustand/localStorage data.
- Add secure logout, device revocation response, credential rotation, and profile removal flows.
- Configure minimal Stronghold capabilities and review app CSP/permissions.

### Acceptance Criteria

- No access token, refresh token, or device credential remains in `localStorage`, `sessionStorage`, or unencrypted persisted Zustand state.
- A restarted client can restore a valid session only through protected credentials and server validation.
- Logout and server-side device revocation remove or invalidate local protected credentials.
- Stronghold access is restricted through explicit Tauri capabilities.
- Existing authentication, permissions, and session-expiration behaviour remain functionally covered by automated tests.

---

## #TBD-13 — `[Installer] Produce Server and Client online, offline, and importable installation artifacts`

**Labels:** `type:installer`, `type:release`, `priority:critical`, `platform:cross-platform`
**Parent epic:** `#<EPIC_NUMBER>`
**Dependencies:** #TBD-02, #TBD-03, #TBD-04, #TBD-09, #TBD-11
**Blocks:** #TBD-14, #TBD-16

### Goal

Generate and document every end-user delivery option with the same verified package contract.

### Scope

- Build `AccoreServer-Setup`, `AccoreServer-Full`, `AccoreServer-App-<version>.accorepkg`.
- Build `AccoreClient-Setup`, `AccoreClient-Full`, `AccoreClient-App-<version>.accorepkg`.
- Implement installer hooks/configuration for required native dependencies such as WebView runtime on Windows.
- Provide non-interactive admin deployment parameters where safe, without accepting secrets through command-line history.
- Produce install/uninstall behaviours that preserve business data by default.

### Acceptance Criteria

- Online Server Setup installs a working complete Server product on a clean reference target.
- Full Server installer succeeds with no network access.
- Server Setup can import a separately downloaded valid `accorepkg` and reject an invalid one.
- Client installers contain no API runtime, database runtime, or Agent binaries.
- Uninstalling desktop UI does not silently delete database files, backups, or organisation data.
- Installer output is correctly named, versioned, signed, and documented per target platform.

---

## #TBD-14 — `[Release] Build signed release, update, rollback, and compatibility pipeline`

**Labels:** `type:release`, `type:security`, `type:operations`, `priority:critical`, `platform:cross-platform`
**Parent epic:** `#<EPIC_NUMBER>`
**Dependencies:** #TBD-02, #TBD-03, #TBD-05, #TBD-08, #TBD-10, #TBD-13
**Blocks:** #TBD-16

### Goal

Create reproducible, signed releases and a safe update lifecycle for both desktop products and server runtime components.

### Scope

- Create release workflows for Server and Client artifacts per platform/architecture.
- Build, sign, and publish Tauri updater artifacts; keep signing keys outside Git.
- Generate the signed Accore release manifest and compatibility matrix.
- Implement staged server updates: preflight, backup, maintenance, migration, restart, health checks, and atomic activation.
- Implement client update policy, including update-required response and compatible server checks.
- Document recovery from failed pre-migration and post-migration updates.

### Acceptance Criteria

- Build output is reproducible from tagged source and records source revision plus artifact digests.
- Tauri updates reject invalid signatures and use production HTTPS endpoints.
- A Server update takes a backup checkpoint before migration and writes a release ledger entry for every outcome.
- A failed pre-migration update returns to the previous healthy runtime automatically.
- A failed post-migration update leaves a clear maintenance/recovery state and does not claim success.
- Client update policy prevents a client from silently running against an incompatible server.

---

## #TBD-15 — `[Operations] Add observability, backup verification, and support runbooks`

**Labels:** `type:operations`, `priority:high`, `platform:cross-platform`
**Parent epic:** `#<EPIC_NUMBER>`
**Dependencies:** #TBD-05, #TBD-06, #TBD-08, #TBD-09
**Blocks:** #TBD-16

### Goal

Make the self-contained server supportable in production through service health, structured logs, backup verification, diagnostics, and operator runbooks.

### Scope

- Define component health model for Agent, database, API, queue, storage, backup age, schema, and client compatibility.
- Add Server Desktop status view and redacted support-bundle export.
- Implement scheduled or operator-driven backup execution and periodic restore verification.
- Document service restart, database recovery, API recovery, queue recovery, disk-capacity incident, certificate renewal, client pairing/revocation, upgrade failure, and restore procedures.
- Add audit events for setup, enrolment, administrative lifecycle actions, backups, and updates.

### Acceptance Criteria

- A server operator can identify the failing component and a recommended next action without reading raw logs first.
- Support bundle contains useful diagnostics but no database password, APP_KEY, private signing key, or user access token.
- Backup verification demonstrates restoration to an isolated validation location on the supported reference platform.
- Runbooks state preconditions, actions, verification, rollback/escalation, and audit expectations.
- Health and service events are retained according to a documented rotation policy.

---

## #TBD-16 — `[Quality] Automate installation, pairing, upgrade, security, and recovery acceptance testing`

**Labels:** `type:operations`, `type:security`, `type:release`, `priority:critical`, `platform:cross-platform`
**Parent epic:** `#<EPIC_NUMBER>`
**Dependencies:** #TBD-04, #TBD-06, #TBD-07, #TBD-08, #TBD-09, #TBD-10, #TBD-11, #TBD-12, #TBD-13, #TBD-14, #TBD-15
**Blocks:** Pilot release

### Goal

Create a release-gating acceptance suite that proves the product behaves correctly on clean devices, through failure paths, and throughout the full server-client lifecycle.

### Scope

- Provision clean platform test environments with no developer runtimes installed.
- Automate Server online installation, Server offline installation, package import, and uninstall-preservation flows.
- Automate Client installation, QR/file/manual pairing, certificate mismatch, invalid endpoint, update-required, device revoke, and secure logout flows.
- Automate database/API/Agent failure simulations, queue backlog checks, interrupted installs, interrupted upgrades, and backup restoration validation.
- Add release gates and evidence retention to CI/release workflow.

### Acceptance Criteria

- The reference platform test starts from a machine with no Node.js, npm, Composer, PHP, or MySQL/MariaDB runtime installed.
- Every artifact path validates signatures and rejects modification.
- Restarting the primary machine restores healthy Server Agent/API/database operation without requiring the desktop UI.
- A paired client can work after normal restart and is denied after revocation or trust mismatch.
- Interrupted installation and upgrade tests can resume or produce documented recovery without data loss.
- Database backup restoration is tested, not merely documented.
- No epic child issue is considered production-complete without an automated or reproducible acceptance test mapped here.

---

## Creation and Linking Order

| Order | Create issue | Why it must occur in this order |
|---:|---|---|
| 1 | Main Epic | Establishes the parent reference and guardrails |
| 2 | #TBD-01 | Removes unresolved distribution, licensing, service, and TLS ambiguity |
| 3 | #TBD-02 and #TBD-03 | Defines artifact trust model and product build separation |
| 4 | #TBD-04 and #TBD-05 | Establishes reusable installer and service foundations |
| 5 | #TBD-06 and #TBD-07 | Makes database and Laravel runtime self-contained |
| 6 | #TBD-08 and #TBD-09 | Adds deterministic server install/upgrade logic and first-run UX |
| 7 | #TBD-10, #TBD-11, and #TBD-12 | Implements API trust, client pairing, and secure sessions |
| 8 | #TBD-13 and #TBD-14 | Produces distributable artifacts and secure update flow |
| 9 | #TBD-15 and #TBD-16 | Completes operational readiness and release-gating verification |

## Repository References

[1]: https://github.com/Emran025/accore-erp/blob/8ddbe38ac0e4629254909319e7c1d9613a9a5325/frontend/src-tauri/tauri.conf.json "Current Tauri configuration"
[2]: https://github.com/Emran025/accore-erp/blob/8ddbe38ac0e4629254909319e7c1d9613a9a5325/backend/composer.json "Current backend development process"
[3]: https://github.com/Emran025/accore-erp/blob/8ddbe38ac0e4629254909319e7c1d9613a9a5325/backend/.env.example "Current database and queue configuration"
[4]: https://github.com/Emran025/accore-erp/blob/8ddbe38ac0e4629254909319e7c1d9613a9a5325/frontend/lib/api.ts "Current frontend API base logic"
[5]: https://github.com/Emran025/accore-erp/blob/8ddbe38ac0e4629254909319e7c1d9613a9a5325/frontend/stores/useAuthStore.ts "Current browser token persistence"
