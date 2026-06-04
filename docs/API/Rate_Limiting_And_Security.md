---
title: "Rate Limiting and Security"
domain: "API"
subdomain: ""
tier: 3
status: draft
task_id: "API-004"
template: "api-endpoint"
version: "1.0.0"
created: "2026-03-26"
last_updated: "2026-03-26"
word_count: 502
---

# Rate Limiting and Security

## Rate Limiting Architecture

accore applies differentiated rate limiting across API operations using Laravel's named throttle middleware. Three rate limiter profiles are applied based on the sensitivity and cost of the operation:

| Throttle Name | Applied To | Typical Limit |
|--------------|-----------|---------------|
| `throttle:api-auth` | Login endpoint (`POST /login`) | Lower limit to prevent brute force |
| `throttle:api-write` | State-mutating `POST` and `PUT` routes | Moderate limit to prevent abuse |
| `throttle:api-delete` | Deletion `DELETE` routes | Lowest limit; deletion is highest risk |

All other read endpoints (`GET`) are protected by authentication but do not carry explicit rate limiter middleware, relying on session-based access control as their primary protection.

<!-- [ASSUMPTION] -->
The exact request-per-minute values for each named throttle profile are configured in `backend/config/` or `bootstrap/app.php` using Laravel's `RateLimiter::for()` facility. The specific limits were not inspectable from the source files reviewed. Business confirmation of the configured limits is required for this document to be complete.

## Authentication Security

The login endpoint is protected by both the `throttle:api-auth` rate limiter and server-side session management. The `ApiAuth` middleware validates every non-login request by checking the `X-Session-Token` header against the server-side session store. There are no client-side JWTs or cookies carrying authentication state; the session token is an opaque identifier with no embedded user data.

## Authorization Enforcement

The `CheckPermission` middleware enforces module-level RBAC on every protected route. Each route declares the minimum required module and action permission explicitly in the route definition via `->middleware('can:module,action')`. Routes without a `can:` middleware are either public or authenticated-only (not permission-gated). There are no implicit permission grants.

## Input Validation

Request validation is performed at the Action class level using Laravel's validation facilities. All incoming data is validated before any business logic is executed. Failed validation results in a `400 Bad Request` response with the `success: false` envelope.

## Audit Logging

All write operations in the system are instrumented with the `TelescopeService.logOperation()` call inside individual Action classes. This creates an audit trail recording the operation type (CREATE, UPDATE, DELETE), the affected model and record ID, the actor, and a before/after data snapshot. The audit log is stored in the EnterpriseCore / MonitoringCompliance domain.

## Security Headers

<!-- [ASSUMPTION] -->
HTTP security headers (CORS, CSP, HSTS, X-Frame-Options) are expected to be configured in Laravel's HTTP kernel middleware stack. The specific header configuration was not inspected from the source reviewed. The API does not expose CORS configuration in the domain route files; CORS settings are assumed to be managed globally. Business confirmation of the CORS policy (allowed origins, credentials mode) is required.

## Known Constraints

- There is no IP allowlisting or blocklisting mechanism visible in the current codebase.
- API key authentication for machine-to-machine access (without a user session) is not currently implemented.
- Token expiry and session timeout duration are managed by the AuthService and are not configurable from the API layer.
