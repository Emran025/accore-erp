# API Endpoint Template

> **Template ID:** api-endpoint
> **Usage:** Documenting API philosophy, endpoint groups, or integration contracts.
> **Scope:** One API topic or endpoint group.
> **Word Target:** ~600 words
> **Note:** This template is for narrative API documentation. Auto-generated OpenAPI specs are separate.

---

## Required Frontmatter

```yaml
---
title: "[API Topic Title]"
domain: "API"
subdomain: ""
tier: 3
status: draft
task_id: "[API-NNN]"
template: "api-endpoint"
version: "1.0.0"
created: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"
word_count: NNN
---
```

---

## Required Sections

### 1. `# [API Topic Title]`

### 2. `## Purpose & Philosophy`
- What business capability does this API surface expose?
- What is the design philosophy governing this area?

### 3. `## Authentication & Authorization`
- What authentication mechanism protects these endpoints?
- What RBAC permissions are required?

### 4. `## Endpoint Summary`
- Table of endpoints:
  | Method | Path | Description | Permission |
  |--------|------|-------------|------------|

### 5. `## Request/Response Contracts`
- For key endpoints: describe the request shape and response structure conceptually.
- **DO NOT** paste raw JSON schemas. Describe the business meaning of each field.

### 6. `## Error Handling`
- Common error codes and their business meaning.
- Validation rules and expected client behavior.

### 7. `## Rate Limiting & Security`
- Applicable rate limits.
- Security considerations specific to this endpoint group.

### 8. `## Versioning`
- What API version does this documentation cover?
- Are there deprecated endpoints?

### 9. `## Assumptions & Open Questions`
- Mandatory section.
