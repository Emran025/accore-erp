# ADR-006: Server Desktop Trust and Network Exposure

**Status:** Accepted
**Date:** 2026-08-20
**Decision owner:** Security, desktop, and platform architecture

## Context

The first self-contained Server Desktop installation is a single-workstation server. Exposing a new database or management channel to the local network before certificate, pairing, firewall, and support policies are complete would create an uncontrolled security surface.

## Decision

The first release is **loopback-only**. MariaDB binds exclusively to `127.0.0.1:3307`; the Laravel API binds exclusively to `127.0.0.1:8765`; and the agent control plane uses a local Windows named pipe. The installer creates a machine-generated database credential and application key. Neither is included in release assets, manifests, logs, diagnostics, screenshots, or the content-addressable runtime cache.

LAN and Internet access are deferred to a separately approved deployment mode. That mode must provide device pairing, mutual trust or certificate pinning, user-visible firewall configuration, TLS certificate lifecycle, and explicit operational ownership.

## Consequences

The initial Server Desktop cannot be used as an unconfigured LAN server. Client Desktop continues to require a separately verified server profile. This restriction is intentional: it prevents a desktop install from accidentally exposing financial data while still allowing reliable local operation.

## Validation

The release gate validates that database and API listeners reject non-loopback binding, that no local control TCP listener is present, and that diagnostics redact secret values.
