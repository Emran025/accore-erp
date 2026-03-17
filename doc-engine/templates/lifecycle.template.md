# Lifecycle Template

> **Template ID:** lifecycle
> **Usage:** Deep-dive documentation of a complex entity lifecycle (state machine).
> **Scope:** One entity's full lifecycle across all states and transitions.
> **Word Target:** ~600 words
> **When to use:** When an entity has 4+ states and the lifecycle warrants its own dedicated page.

---

## Required Frontmatter

```yaml
---
title: "[Entity Name] Lifecycle"
domain: "[DomainName]"
subdomain: "[SubdomainName]"
tier: [1-5]
status: draft
task_id: "[PREFIX-NNN]"
template: "lifecycle"
version: "1.0.0"
created: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"
word_count: NNN
---
```

---

## Required Sections (in this exact order)

### 1. `# [Entity Name] Lifecycle`

### 2. `## Overview`
- Brief (2–3 sentences) explaining why this lifecycle is documented as a standalone page.
- Identify the entity and its business significance.

### 3. `## State Diagram`
- A Mermaid `stateDiagram-v2` diagram showing ALL valid states and transitions.
- Mark terminal states clearly.
- Indicate irreversible transitions.

### 4. `## State Definitions`
- For each state, provide:
  | State | Business Meaning | Entry Condition | Exit Condition |
  |-------|-----------------|-----------------|----------------|

### 5. `## Transition Rules`
- For each transition:
  - Source state → Target state
  - Who/what triggers the transition (user action, system event, scheduled job)
  - Required preconditions
  - Side effects (events emitted, ledger entries created, etc.)
- Use numbered list format.

### 6. `## Irreversibility & Immutability`
- Which transitions are one-way?
- What audit implications exist?
- How are corrections handled if a wrong transition occurs?

### 7. `## Integration Impact`
- What other domains or modules are affected by state transitions?
- What integration events fire on each transition?

### 8. `## Assumptions & Open Questions`
- Mandatory section. "None identified." if empty.
