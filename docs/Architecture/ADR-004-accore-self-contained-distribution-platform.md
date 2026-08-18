# ADR-004: Accore Self-Contained Distribution Platform and Product Flavours

**Status:** Proposed
**Date:** 2026-08-18
**Decision owner:** Desktop architecture and operations
**Related issues:** #38, #39, #41, #42, #51

## Context

The current ERP repository has independent frontend and backend development lifecycles. Tauri packages the static Next.js output, while Laravel and MySQL remain separately managed processes in development. This is appropriate for development but cannot be the end-user operational model: an ERP customer must not install Node.js, npm, Composer, PHP, or an existing database service to run the product.[1] [2] [3]

The product must support two operational roles without splitting the ERP source code. A primary machine must run the organisation server and the normal ERP desktop interface. Other workstations must run the same ERP interface but only after establishing a trusted connection to that primary server over LAN or the Internet.

## Decision

Accore will be distributed as **two product flavours built from one source repository**:

| Product | Purpose | Runtime contents | Explicit exclusion |
|---|---|---|---|
| **Accore Server** | Primary-machine ERP desktop and organisation server | Tauri desktop UI, Server Agent, Accore API runtime, AccoreDB runtime, queue runtime, verified package cache | Developer toolchains and direct user control of database processes |
| **Accore Client** | User workstation desktop | Tauri desktop UI, connection gate, encrypted client secrets, verified client cache | Laravel/PHP runtime, database runtime, Server Agent, server-control capabilities |

The initial production reference target is **Windows x64**. The distribution architecture remains portable by design: the installer core and Server Agent are written in Rust, and platform integrations are isolated behind Windows Service Control Manager, macOS `launchd`, and Linux `systemd` adapters. macOS and Linux installers are not declared production-supported until their clean-device installation, service-lifecycle, update, and recovery acceptance matrices pass.

The Server and Client products share the existing Next.js UI and Laravel domain implementation. They use separate Tauri configuration overlays, bundle identifiers, capabilities, updater channels, and product-specific native contents. Client capabilities never include Server Agent control or server binaries. A compile-time flavour value may tailor the UI bootstrap experience, but it is not a security boundary; packaging and capability separation are the security boundary.

## Consequences

The repository gains a `distribution/` workspace, two Tauri product configurations, and release workflows for Server and Client. Development commands such as `npm run dev`, `php artisan serve`, and `composer dev` remain supported only as development conveniences. Production paths must use packaged runtime binaries and the Server Agent rather than user PATH tools.

This decision creates a deliberate support boundary. Windows x64 receives first-class automated coverage and pilot support. Adding macOS or Linux becomes an explicit release decision backed by the same evidence, not an unsupported best-effort claim.

## Alternatives considered

| Alternative | Decision | Reason |
|---|---|---|
| One Tauri desktop package that starts Laravel/MySQL directly from its window | Rejected | Closing the UI can terminate business services, makes restart/recovery fragile, and mixes UI authority with service authority. |
| Install Node, PHP, Composer, and MySQL on each customer device | Rejected | Depends on user environment, creates version conflicts, expands support burden, and does not meet the self-contained product requirement. |
| Separate Server and Client source repositories | Rejected | Duplicates UI/domain logic and risks behavioural drift. |
| Windows-only architecture | Rejected | Windows x64 is the first supported target, but platform-specific code must remain isolated to preserve a viable cross-platform path. |

## Security and operational implications

The Server installation must use a system-wide runtime home owned by a dedicated service identity. Mutable customer data, Laravel storage, secrets, logs, and backups stay outside application binaries and versioned runtime directories. Server Desktop does not own or directly start the database; it communicates with the Agent through an authenticated local management channel.

A Client cannot silently fall back to a production localhost API. It must pass an explicit Connection Gate that verifies endpoint, TLS, server identity, compatibility, and enrolment before protected ERP routes are entered.

## Approval and review record

This ADR requires sign-off by the Backend Architecture, Desktop Architecture, Security, Operations, and Product owners before #41 or #42 is marked complete. Any change to initial platform support requires an ADR amendment and release-matrix update.

## References

[1]: https://github.com/Emran025/accore-erp/blob/8ddbe38ac0e4629254909319e7c1d9613a9a5325/frontend/src-tauri/tauri.conf.json "Current Tauri configuration"
[2]: https://github.com/Emran025/accore-erp/blob/8ddbe38ac0e4629254909319e7c1d9613a9a5325/backend/composer.json "Current Laravel development commands"
[3]: https://github.com/Emran025/accore-erp/blob/8ddbe38ac0e4629254909319e7c1d9613a9a5325/backend/.env.example "Current MySQL and queue defaults"
