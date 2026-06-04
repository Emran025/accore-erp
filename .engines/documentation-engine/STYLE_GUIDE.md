# accore Documentation Engine — Style Guide

> **Purpose:** Governs the tone, formatting, and visual standards for all AI-generated documentation.
> **Authority:** This file is immutable without Chief Architect approval.

---

## 1. Tone & Voice

- **Professional, objective, and analytical.** No informal language, slang, humor, or speculation.
- **Third person, present tense.** Write "The system validates…" not "We validate…" or "You should validate…"
- **Declarative, not instructional** (except in Developer Tier). Write "Invoices are immutable after posting" not "Do not modify invoices after posting."
- **Business-first.** Explain the business reason before the technical mechanism.

---

## 2. Capitalization Rules

- **Always capitalize Domain Artifacts:** Sales Invoice, General Ledger, Chart of Accounts, Purchase Order, Employee Record, Cost Center.
- **Always capitalize Bounded Context names:** Finance, Commercial, SupplyChain, HumanCapital.
- **Always capitalize system patterns:** Action Layer, Service Layer, Domain Event, Integration Event.
- **Never capitalize generic nouns:** system, module, document, record, entry (when used generically).

---

## 3. Heading Hierarchy

Every document MUST follow this heading structure:

```markdown
# Document Title (H1 — exactly one per document)
## Major Section (H2)
### Subsection (H3)
#### Detail (H4 — use sparingly)
```

- **Never skip heading levels** (e.g., no H1 → H3).
- **H1 MUST match the `title` field in frontmatter.**
- **Maximum heading depth:** H4.

---

## 4. Frontmatter Standard

Every generated document MUST begin with YAML frontmatter:

```yaml
---
title: "Exact Document Title"
domain: "DomainName"
subdomain: "SubdomainName"
tier: 1-5
status: draft
task_id: "PREFIX-NNN"
template: "template-name"
version: "1.0.0"
created: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"
word_count: NNN
---
```

---

## 5. Mermaid Diagram Standards

- **ALL diagrams MUST use Mermaid.js syntax** inside fenced code blocks.
- **External image files are PROHIBITED** for flowcharts, state machines, or architecture diagrams.
- **Recommended diagram types:**
  - `stateDiagram-v2` — for document lifecycles
  - `flowchart TD` or `flowchart LR` — for process flows
  - `erDiagram` — for entity relationships
  - `sequenceDiagram` — for integration event flows
- **Node labels containing special characters MUST be quoted:**
  ```mermaid
  flowchart TD
      A["Draft (Initial)"] --> B["Submitted"]
  ```
- **Maximum complexity:** 15 nodes per diagram. Split into multiple diagrams if needed.

---

## 6. Lists & Tables

- Use **bulleted lists** for unordered items (characteristics, properties).
- Use **numbered lists** for sequential steps or prioritized items.
- Use **tables** for structured comparisons, field definitions, or status mappings.
- **Table headers MUST be bold** (Markdown default).

---

## 7. Cross-References

- Reference other documents using relative Markdown links: `[Chart of Accounts Governance](../Finance/GeneralLedger/Chart_Of_Accounts_Governance.md)`
- **NEVER use absolute file system paths** in documentation output.
- Cross-domain references are allowed ONLY in Integration Event documents.

---

## 8. Code in Documentation

- **Tier 1, 3, 5:** NO code blocks. Describe concepts narratively.
- **Tier 2 (Architecture):** Pseudocode or structural patterns allowed (no framework-specific code).
- **Tier 4 (Developer):** Concrete code examples required. Use PHP/Laravel syntax with proper fencing:
  ```php
  // Example code block
  ```
- **Domain docs:** Code blocks forbidden. Describe behavior, not implementation.

---

## 9. Forbidden Patterns

| Pattern | Why Forbidden |
|---------|--------------|
| "This module basically does…" | Informal, vague |
| "The code works by calling X then Y then Z" | Line-by-line code narration |
| "We recommend…" / "You should…" | Not declarative |
| Screenshots or bitmap images | Cannot be version-controlled |
| HTML tags in Markdown | Breaks portability (except `<!-- [ASSUMPTION] -->`) |
| Emoji in headings or body text | Unprofessional for enterprise docs |

---

## 10. Page Length Enforcement

| Metric | Value |
|--------|-------|
| Target word count | ~600 words |
| Minimum word count | 400 words |
| Maximum word count | 650 words |
| Counting method | Body text only (excludes frontmatter, Mermaid code, table syntax) |
