# Domain Standard Template

> **Template ID:** domain-standard
> **Usage:** Documenting a specific subdomain module within a Bounded Context.
> **Scope:** One subdomain, one business capability.
> **Word Target:** ~600 words

---

## Required Frontmatter

```yaml
---
title: "[Descriptive Title]"
domain: "[DomainName]"
subdomain: "[SubdomainName]"
tier: [1-5]
status: draft
task_id: "[PREFIX-NNN]"
template: "domain-standard"
version: "1.0.0"
created: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"
word_count: NNN
---
```

---

## Required Sections (in this exact order)

### 1. `# [Descriptive Title]`
H1 heading. Must match `title` in frontmatter.

### 2. `## Business Context & Objective`
- What real-world business problem does this module solve?
- What enterprise process does it support or automate?
- Who are the primary users or stakeholders?
- **Business reasoning FIRST, technical details AFTER.**

### 3. `## Domain Entities`
- List the primary entities (Models) in this subdomain.
- For each: name, business definition, and relationship to the module's purpose.
- Use a table for clarity:
  | Entity | Business Definition | Role |
  |--------|-------------------|------|

### 4. `## State Machine / Lifecycle`
- Document the lifecycle of the primary entity.
- Define all valid states and transitions.
- Include a Mermaid `stateDiagram-v2` diagram.
- Identify which transitions are irreversible.

### 5. `## Business Rules & Constraints`
- List every immutable business rule.
- Use numbered list format.
- Each rule MUST be declarative: "X is required when Y."
- Flag any rules inferred from code with `<!-- [ASSUMPTION] -->`.

### 6. `## Integration Events`
- What Domain Events does this module emit?
- Which other modules subscribe to these events?
- What Domain Events does this module consume from other modules?
- Use a table:
  | Event | Direction | Connected Domain | Trigger |
  |-------|-----------|-----------------|---------|

### 7. `## Key Operations`
- Describe the primary Actions available in this module.
- For each Action: name, business purpose, and inputs/outputs (conceptual, not code).
- **DO NOT** describe the implementation. Describe the **business operation**.

### 8. `## Known Constraints`
- List constraints that limit system behavior.
- Examples: "Cannot delete a posted invoice", "Fiscal period must be open".
- Include regulatory or audit-relevant constraints.

### 9. `## Assumptions & Open Questions`
- List any `[ASSUMPTION]` markers placed in the document.
- List any questions requiring business input.
- This section is MANDATORY even if empty (write "None identified.").
