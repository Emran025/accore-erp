# ADR-006: Client–Server Trust, Pairing, and Network Boundary

**Status:** Proposed
**Date:** 2026-08-18
**Decision owner:** Security architecture and desktop architecture
**Related issues:** #38, #39, #48, #49, #50

## Context

Accore Client must operate against a primary Accore Server on the same machine, a local network, or the Internet. The current frontend API helper falls back to a local HTTP address when no public API base is supplied.[1] That is acceptable as a development convenience but unsafe as a production client connection model: a user could accidentally reach a wrong service, accept an untrusted endpoint, or enter ERP screens without reliable server compatibility verification.

A professional desktop product needs a first-run connection experience that creates a durable trust relationship with the organisation server, without exposing database credentials or allowing an arbitrary network device to enrol itself.

## Decision

Accore Client will use a **Connection Gate** before login and protected ERP routes. A connection becomes valid only after endpoint validation, TLS validation, server-identity binding, API compatibility validation, and successful device enrolment when policy requires it.

| Deployment mode | Endpoint | Required trust mechanism | Exposure policy |
|---|---|---|---|
| Local Server Desktop | Explicit local Server profile | Local Server Agent/API readiness and server identity | API bound to loopback unless LAN mode is enabled |
| LAN Client | QR code, signed pairing file, DNS/mDNS name, or manual HTTPS URL | TLS plus server identity/certificate binding and one-time enrolment evidence | HTTPS API only; database stays loopback-only |
| Internet Client | Organisation DNS name, QR code, or pairing file | Publicly trusted TLS or approved enterprise PKI plus server identity binding | HTTPS API through explicit firewall and DNS policy |

Release clients accept `https://` endpoints only. Development-only HTTP allowances are excluded from release builds. A certificate mismatch is not a user-bypassable warning; it is a hard pairing failure until an authorised administrator issues new trust material.

The Laravel API gains a narrow rate-limited bootstrap contract:

| Route | Purpose | Authentication |
|---|---|---|
| `GET /api/v1/desktop/bootstrap` | Server identity, health, enrolment mode, API contract, and minimum client version | None, rate-limited; response contains no ERP or secret data |
| `POST /api/v1/desktop/enroll` | Consume short-lived, single-use pairing evidence and register a device | Pairing proof only |
| `GET /api/v1/desktop/policy` | Return compatibility and feature policy | Registered device and authenticated user |

A pairing code is stored hashed, expires, is single-use by default, and may be constrained to a network scope. The Server administrator creates/revokes codes and devices through authenticated Server Desktop controls. Client devices receive neither database credentials nor Server Agent access.

## Consequences

The Client product removes the implicit production fallback to `http://127.0.0.1:8000/api` and resolves its API base from a verified Server Profile. Public profile metadata and cryptographic trust state are stored separately. The connection gate must show distinct retryable states for unreachable server, invalid TLS, identity mismatch, incompatible version, revoked device, and incomplete enrolment.

LAN server exposure becomes an explicit, audited administrative decision. The Server Agent configures the allowed HTTPS listener and firewall scope only after a Server administrator enables LAN mode. Public Internet exposure additionally requires approved DNS and certificate operations; it is not achieved by opening a raw port without TLS and policy controls.

## Alternatives considered

| Alternative | Decision | Reason |
|---|---|---|
| Store a configurable API URL and proceed immediately | Rejected | Does not prove server identity, compatibility, or device authorisation. |
| Permit user acceptance of certificate warnings | Rejected | Enables man-in-the-middle and wrong-server acceptance in a financial application. |
| Use direct database connections from Client | Rejected | Circumvents API authorisation, audit, validation, and business invariants. |
| Require public Internet access for every installation | Rejected | LAN and single-machine deployments must operate without public exposure. |

## Approval and review record

Security, Desktop Architecture, Backend Architecture, and Operations must approve the bootstrap response schema, certificate model, pairing-code lifetime, device-revocation behaviour, firewall defaults, and Internet deployment prerequisites before #48 and #49 are marked complete.

## References

[1]: https://github.com/Emran025/accore-erp/blob/8ddbe38ac0e4629254909319e7c1d9613a9a5325/frontend/lib/api.ts "Current frontend API base behaviour"
[2]: https://github.com/Emran025/accore-erp/blob/8ddbe38ac0e4629254909319e7c1d9613a9a5325/frontend/stores/useAuthStore.ts "Current frontend authentication persistence"
[3]: https://github.com/Emran025/accore-erp/blob/8ddbe38ac0e4629254909319e7c1d9613a9a5325/docs/API/Authentication_And_Authorization_Contracts.md "Existing authentication contract"
