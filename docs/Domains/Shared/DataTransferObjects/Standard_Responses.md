---
title: "Standard DTOs and Responses"
domain: "Shared"
subdomain: "DataTransferObjects"
tier: 1
status: draft
task_id: "SHR-003"
template: "domain-standard"
version: "1.0.0"
created: "2026-03-26"
last_updated: "2026-03-26"
word_count: 545
---

# Standard DTOs and Responses

## Business Context & Objective

Consistent API response shapes and typed data transfer objects are fundamental to the reliability and discoverability of the accore API. Consumer teams (frontend developers, integration partners, and automated test harnesses) depend on a predictable response envelope so that error handling, pagination, and success parsing are uniform across every endpoint. The Shared domain's DataTransferObject base class and the Action base class's response helpers together define the full response contract for the system. This document serves as the authoritative reference for any developer building a new action or writing a client integration.

## Response Envelope Structure

All API responses produced by the Action base class follow one of three envelope shapes:

### Success Response

```json
{
  "success": true,
  "message": "Optional human-readable message",
  "<data_key>": "Single-object fields merged at top level, OR",
  "data": ["Array response wrapped in data key"]
}
```

The success response uses two serialization strategies depending on the result:
- **Single object result:** Fields are merged at the top level alongside `"success": true`. The consumer accesses fields directly (e.g., `response.id`, `response.name`).
- **Array / list result:** The data is placed inside a `"data"` key to distinguish it from scalar response fields.

### Error Response

```json
{
  "success": false,
  "message": "Human-readable error description"
}
```

The error response always includes an HTTP status code in the `4xx` or `5xx` range. The default error status code is `400 Bad Request`. Domain-specific actions may override the status code for authorization errors (`403`), not-found errors (`404`), or server errors (`500`).

### Paginated Response

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "current_page": 1,
    "per_page": 25,
    "total_records": 142,
    "total_pages": 6
  }
}
```

Paginated responses wrap the result array in `"data"` and always include the four-field `"pagination"` object. Consumers must use `total_pages` to determine whether additional pages exist.

## DataTransferObject Contract

Every DTO in accore extends the abstract `DataTransferObject` base class and implements three mandatory factory methods:

| Method | Signature | Purpose |
|--------|-----------|---------|
| `fromRequest` | `static fromRequest(Request $request): static` | Creates the DTO from an HTTP Request object. Used by controllers and invokable actions receiving HTTP input. |
| `fromArray` | `static fromArray(array $data): static` | Creates the DTO from a plain associative array. Used in testing and programmatic action invocation. |
| `toArray` | `toArray(): array` | Serializes the DTO back to an array for passing to models, services, or other layers. |

DTOs replace raw Request leaking between layers; an action must never accept a raw `Request` object directly in its `execute()` method. The DTO acts as the validated, typed input contract.

## Business Rules & Constraints

1. The `"success"` boolean key is mandatory in all response envelopes; a response that omits it is non-compliant.
2. The `"message"` key is optional in success responses but must be present in all error responses.
3. Pagination metadata uses zero-indexed `current_page` starting at 1; page 0 is not valid.
4. DTOs are immutable after construction; fields must not be mutated post-construction.
