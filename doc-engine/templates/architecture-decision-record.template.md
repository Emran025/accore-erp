# Architecture Decision Record (ADR) Template

> **Template ID:** architecture-decision-record
> **Usage:** Documenting WHY a specific architectural, technological, or structural decision was made.
> **Scope:** One decision.
> **Word Target:** ~600 words

---

## Required Frontmatter

```yaml
---
title: "ADR-NNN: [Decision Title]"
domain: "[DomainName or 'cross-cutting']"
subdomain: ""
tier: 2
status: draft
task_id: "[PREFIX-NNN]"
template: "architecture-decision-record"
version: "1.0.0"
created: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"
word_count: NNN
---
```

---

## Required Sections

### 1. `# ADR-NNN: [Decision Title]`

### 2. `## Context`
- What problem or challenge prompted this decision?
- What was the system state before this decision?

### 3. `## Decision`
- What was decided?
- State the decision clearly and concisely.

### 4. `## Rationale`
- Why was this option chosen over alternatives?
- What trade-offs were evaluated?

### 5. `## Alternatives Considered`
- List alternatives that were evaluated and rejected.
- For each: brief description and reason for rejection.

### 6. `## Consequences`
- What are the positive consequences of this decision?
- What are the negative consequences or trade-offs?
- What technical debt, if any, does this decision introduce?

### 7. `## Status`
- `proposed` | `accepted` | `deprecated` | `superseded by ADR-NNN`

### 8. `## Related Decisions`
- Link to other ADRs that are related or dependent.
