---
title: "API Philosophy and Versioning"
domain: "API"
subdomain: ""
tier: 3
status: draft
task_id: "API-001"
template: "api-endpoint"
version: "1.0.0"
created: "2026-03-26"
last_updated: "2026-03-26"
word_count: 574
---

# API Philosophy and Versioning

## Design Philosophy

ACCSYSTEM's API is a domain-segregated RESTful JSON API. Every endpoint reflects a distinct business action owned by a specific domain. The API is designed around the Single Action Class pattern: each controller method maps to a dedicated Action class with a single responsibility, ensuring that the API surface is granular, testable, and independently documented.

The API rejects GraphQL and RPC-style patterns. All operations are resource-oriented, and HTTP verbs convey intent: `GET` for reads, `POST` for creates, `PUT` for updates, and `DELETE` for deletions. The API does not use partial update methods (`PATCH`).

## Versioning Strategy

The API uses URL-based versioning with the prefix `/api/v2`. All current production routes are prefixed under `v2`. Legacy endpoints from the prior version may exist as named aliases under a `/legacy/` path prefix within the `v2` router, but these are deprecated and subject to removal.

```
Base URL pattern: /api/v2/{resource}
Example:          /api/v2/analytics/reports/balance-sheet
Legacy alias:     /api/v2/legacy/reports/balance_sheet
```

New breaking changes will increment the version to `v3`. Non-breaking additions (new fields, new endpoints) are added to the current version without a version bump.

## Response Envelope

All responses use the Shared domain's standard envelope. See [Standard DTOs and Responses](../Domains/Shared/DataTransferObjects/Standard_Responses.md) for the full specification.

| Response Type | `success` | `data` Key | `pagination` Key |
|--------------|-----------|-----------|-----------------|
| Single object | `true` | Fields merged at top level | Not present |
| Array / list | `true` | `data` array | Not present (unless paginated) |
| Paginated list | `true` | `data` array | Present with 4 fields |
| Error | `false` | Not present | Not present |

## Pagination

List endpoints that return potentially large datasets use query parameters for pagination:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `page` | `1` | Page number (1-indexed) |
| `per_page` | `25` | Records per page |

Paginated responses include the `pagination` object with `current_page`, `per_page`, `total_records`, and `total_pages`.

## Error Handling

Errors return a `success: false` envelope with a `message` string. HTTP status codes are meaningful:

| Status Code | Meaning |
|------------|---------|
| `400` | Validation or business rule error |
| `401` | Unauthenticated — no session token or expired session |
| `403` | Unauthorized — authenticated but lacks required permission |
| `404` | Resource not found |
| `500` | Unhandled server error |

## Route Organization

Routes are split into domain-specific files under `backend/routes/domains/`, numbered by domain (00-auth through 10-platform). All routes except `/login` require the `api.auth` middleware. Routes with write operations (`POST`, `PUT`, `DELETE`) additionally apply a `throttle:api-write` or `throttle:api-delete` middleware for rate limiting.

## Content Type

All requests and responses use `Content-Type: application/json`. There are no form-encoded or multipart endpoints except where file upload is explicitly required.

## Governance

New API endpoints must be added to the domain-specific route file corresponding to their domain. Route naming follows the pattern `v2.{domain}.{resource}.{action}`. The `can:` middleware alias must be applied to any route accessing protected resources, specifying the module and action permission.
