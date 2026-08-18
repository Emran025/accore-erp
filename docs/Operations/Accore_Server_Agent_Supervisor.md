# Accore Server Agent Supervisor

**Status:** Implemented core contract
**Date:** 2026-08-18
**Related issues:** #38, #43, #44, #45

## Purpose

Accore Server Agent is the machine-scoped supervisor for an installed Accore Server. It is separate from Accore Server Desktop: the desktop application may close without stopping the database, API runtime, or queue processor. The Agent is registered as an operating-system service and provides lifecycle control only through a protected local channel.

> The Agent never publishes a TCP lifecycle endpoint. Windows uses an administrator-restricted named pipe; macOS and Linux use a mode-`0600` Unix socket. Remote peers and unprivileged local users are not accepted as control identities.

## Runtime Ordering

| Operation | Required order | Safety rule |
|---|---|---|
| Startup | AccoreDB → API runtime → queue processor | Every service must pass its readiness gate before its dependent service starts. |
| API failure | Bounded API restart | The database remains running; restart attempts are limited to three. |
| Database failure | Queue stop → API stop | Dependent serving ends and the Agent reports an unhealthy state. |
| Administrative shutdown | Queue drain → queue stop → API stop → database stop | Database shutdown never precedes queue draining and API shutdown. |

## Platform Registration

| Platform | Native host | Boot behavior | Protected control endpoint |
|---|---|---|---|
| Windows | Service Control Manager | `AccoreServerAgent` starts at boot | `\\.\pipe\AccoreServerAgent`, administrators only |
| macOS | `launchd` | `im.accore.server-agent` starts at boot | `/var/run/accore/server-agent.sock`, mode `0600` |
| Linux | `systemd` | `accore-server-agent.service` starts at boot | `/var/run/accore/server-agent.sock`, mode `0600` |

The current crate is deliberately limited to the deterministic supervision policy, platform registration contract, and authorization boundary. Concrete packaged database and Laravel runtime process adapters are owned by Issues #44 and #45; they must implement the Agent runtime-controller interface rather than creating independent process managers.

## Verification

The unit suite proves startup and shutdown order, bounded API recovery without database termination, dependency shutdown after database failure, rejection of untrusted local control identities, and protected boot-service descriptors for all supported platforms.
