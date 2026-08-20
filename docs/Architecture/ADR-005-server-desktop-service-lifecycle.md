# ADR-005: Server Desktop Service Lifecycle and Operator Control

**Status:** Accepted
**Date:** 2026-08-20
**Decision owner:** Desktop, platform, backend, and operations architecture

## Context

A local ERP server must remain operational independently of its management window. Closing the Server Desktop window must not terminate the database, API, queue worker, scheduled maintenance, or backup policy. At the same time, an unprivileged local process must not be able to start or stop those components.

## Decision

The product uses a dedicated **ACCORE Server Agent** installed as a Windows service for the initial Windows x64 release. The desktop window is an authenticated local management surface, not the long-lived server process.

| Lifecycle event | Required behavior |
|---|---|
| First launch | Elevate once for machine provisioning, create durable storage, install the agent, and show initialization progress. |
| Operating-system boot | Windows Service Control Manager starts the agent before any desktop UI is opened. |
| Server Desktop opens | The UI reads a sanitized, Users-read-only status snapshot and shows component readiness. |
| Desktop UI closes | The agent, database, API, queue, and scheduled maintenance remain active. |
| API failure | Agent records diagnostics and performs bounded restart with backoff; it keeps the database running. |
| Database failure | Agent stops API and queue, publishes an unhealthy status, and never presents the ERP login as operational. |
| Administrative stop | Agent drains queue work, stops API, then stops the database. |

Lifecycle commands are sent only through Windows Service Control Manager by an elevated Agent invocation. There is no TCP control port and no user-writable stop signal. The agent runs the database first, waits for a loopback probe, provisions or starts the API second, waits for `/up`, and starts the queue last.

## Consequences

The Windows installer requests elevation for machine provisioning, service registration, lifecycle commands, and ACL enforcement. Agent configuration, database files, Laravel storage, logs, and control material are readable and writable only by LocalSystem and local administrators; the UI receives a separate non-secret status snapshot. Service failure becomes an explicit operating condition with component state, recommended recovery actions, and a retry control; it is never represented as an ordinary credential failure.

## Validation

Acceptance tests must cover service installation, boot start, desktop-close continuity, API bounded restart, database-failure containment, denied ordinary-user writes to the secret data root, and ordered administrative shutdown.
