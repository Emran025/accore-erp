# Constraint Template

> **Template ID:** constraint
> **Usage:** Documenting critical business constraints, immutability rules, or regulatory requirements.
> **Scope:** One constraint domain or a tightly related set of constraints.
> **Word Target:** ~600 words

---

## Required Frontmatter

```yaml
---
title: "[Constraint Title]"
domain: "[DomainName]"
subdomain: "[SubdomainName]"
tier: [1-5]
status: draft
task_id: "[PREFIX-NNN]"
template: "constraint"
version: "1.0.0"
created: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"
word_count: NNN
---
```

---

## Required Sections

### 1. `# [Constraint Title]`

### 2. `## Business Rationale`
- Why does this constraint exist?
- What business, legal, or financial risk does it mitigate?

### 3. `## Constraint Definition`
- Formal, precise statement of the constraint.
- Use declarative language: "A [Entity] MUST/MUST NOT [condition] when [context]."
- List all related sub-constraints.

### 4. `## Affected Entities & Operations`
- Which entities are subject to this constraint?
- Which operations enforce it?
- What happens when the constraint is violated (error, rejection, logging)?

### 5. `## Enforcement Mechanism`
- Is the constraint enforced at the application layer, database layer, or both?
- Is it enforced by an Action, a Service, a Model mutator, or a database trigger?
- **Describe conceptually** — do not paste code.

### 6. `## Audit & Compliance Implications`
- Is this constraint relevant to financial auditing?
- Does violation of this constraint constitute a compliance breach?
- How is constraint enforcement logged?

### 7. `## Edge Cases`
- Are there legitimate scenarios where this constraint is relaxed?
- How are corrections handled when the constraint blocks a legitimate operation?

### 8. `## Assumptions & Open Questions`
- Mandatory section.
