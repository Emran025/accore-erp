# Task: SYS-005 — Cross-Domain Integration Patterns

---

## Metadata

| Field | Value |
|-------|-------|
| **Task ID** | SYS-005 |
| **Phase** | 1 |
| **Domain** | System |
| **Tier** | 1 |
| **Template** | `integration-event` |
| **Output Path** | `/docs/System/Cross_Domain_Integration_Patterns.md` |
| **Page Count** | 1 |
| **Dependencies** | SYS-002, SYS-004 |

---

## Objective

Document the patterns used for cross-domain communication in ACCSYSTEM. Define how Bounded Contexts interact without violating their boundaries, what Integration Events look like, and the general contract for inter-domain messaging.

---

## Strict Scope

### IN SCOPE
- Domain Event vs. Integration Event distinction
- Event naming conventions
- Subscriber contract expectations
- Key cross-domain paths (e.g., Sales → GL posting, Payroll → GL posting)
- Mermaid sequence diagram of a representative integration flow

### OUT OF SCOPE
- Individual event payloads (covered per-domain)
- Technical event bus implementation
- Individual domain internals

---

## Input Files / Folders

| Type | Path | Purpose |
|------|------|---------|
| All Domain dirs | `backend/app/Domains/` | Identify cross-domain references |
| Policy | `/DocumentationPolicy.md` | Integration pattern definitions |
| Event files | Search for `Event` classes across domains | Identify event patterns |

---

## Forbidden Assumptions

1. Do NOT assume synchronous or asynchronous behavior without evidence.
2. Do NOT describe individual events — document the PATTERN.
3. Flag all inferred event flows with `[ASSUMPTION]`.

---

## Quality Checklist

- [ ] Uses `integration-event` template
- [ ] Word count: 400–650
- [ ] At least one Mermaid sequence diagram
- [ ] Pattern-level, not instance-level
- [ ] Frontmatter complete
