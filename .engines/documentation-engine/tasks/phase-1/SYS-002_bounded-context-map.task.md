# Task: SYS-002 — Bounded Context Map

---

## Metadata

| Field | Value |
|-------|-------|
| **Task ID** | SYS-002 |
| **Phase** | 1 |
| **Domain** | System |
| **Tier** | 1 |
| **Template** | `system-philosophy` |
| **Output Path** | `/docs/System/Bounded_Context_Map.md` |
| **Page Count** | 1 |
| **Dependencies** | SYS-001 |

---

## Objective

Document the complete Bounded Context Map of the ACCSYSTEM ERP. Define each domain, its boundaries, its subdomain structure, and how domains interact with each other. This document serves as the canonical reference that all subsequent domain documentation builds upon.

---

## Strict Scope

### IN SCOPE
- Enumerate all 11 Bounded Contexts (Domains)
- Map each domain's subdomains
- Define the boundaries of each domain (what belongs, what doesn't)
- Identify integration points between domains
- Include a Mermaid diagram of the full context map

### OUT OF SCOPE
- Internal module implementations
- Database schemas
- API endpoints
- Individual entity descriptions

---

## Input Files / Folders

| Type | Path | Purpose |
|------|------|---------|
| Directory | `backend/app/Domains/` | Full domain structure |
| README files | `backend/app/Domains/*/README.md` | Domain descriptions |
| Policy | `/DocumentationPolicy.md` | Domain definitions |

---

## Forbidden Assumptions

1. Do NOT invent domains that don't exist in the codebase.
2. Do NOT assume integration patterns — flag with `[ASSUMPTION]` if inferred.
3. Do NOT describe subdomain internals — only their existence and purpose.

---

## Quality Checklist

- [ ] All 11 domains listed
- [ ] Mermaid context map diagram included
- [ ] No internal implementation details
- [ ] Word count: 400–650
- [ ] Frontmatter complete
