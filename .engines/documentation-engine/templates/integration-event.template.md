# Integration Event Template

> **Template ID:** integration-event
> **Usage:** Documenting cross-domain events and their contracts.
> **Scope:** One integration event or a tightly related group of events.
> **Word Target:** ~600 words

---

## Required Frontmatter

```yaml
---
title: "[Event/Integration Name]"
domain: "[DomainName]"
subdomain: "[SubdomainName]"
tier: [1-5]
status: draft
task_id: "[PREFIX-NNN]"
template: "integration-event"
version: "1.0.0"
created: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"
word_count: NNN
---
```

---

## Required Sections

### 1. `# [Event/Integration Name]`

### 2. `## Business Context`
- Why does this integration exist?
- What business process requires cross-domain communication?

### 3. `## Event Contract`
- Event name (class name or identifier)
- Publishing domain
- Subscribing domain(s)
- Payload summary (conceptual, not code):
  | Field | Type | Business Meaning |
  |-------|------|-----------------|

### 4. `## Sequence Diagram`
- Mermaid `sequenceDiagram` showing the event flow.
- Include publisher, event bus, and all subscribers.

### 5. `## Trigger Conditions`
- What state change or user action causes this event to fire?
- Are there conditions under which the event does NOT fire?

### 6. `## Subscriber Behavior`
- For each subscriber: what action does it perform upon receiving the event?
- Are subscriber actions synchronous or asynchronous?
- Can a subscriber failure block the publisher?

### 7. `## Failure & Retry Strategy`
- What happens if a subscriber fails?
- Is there a retry mechanism?
- Is the event persisted for replay?

### 8. `## Assumptions & Open Questions`
- Mandatory section.
