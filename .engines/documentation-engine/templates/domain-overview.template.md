# Domain Overview Template

> **Template ID:** domain-overview
> **Usage:** Generating the `Overview.md` file for any Domain or Tier folder.
> **Scope:** Sets the strategic context for an entire domain. Does NOT document individual modules.
> **Word Target:** ~600 words

---

## Required Frontmatter

```yaml
---
title: "[Domain Name] — Domain Overview"
domain: "[DomainName]"
subdomain: ""
tier: [1-5]
status: draft
task_id: "[PREFIX-001]"
template: "domain-overview"
version: "1.0.0"
created: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"
word_count: NNN
---
```

---

## Required Sections (in this exact order)

### 1. `# [Domain Name] — Domain Overview`
H1 heading. Must match the `title` in frontmatter.

### 2. `## Business Purpose`
- What real-world business function does this domain serve?
- Why does this domain exist in an enterprise ERP?
- What business stakeholders depend on this domain?
- **DO NOT** describe technical implementation.

### 3. `## Bounded Context Boundaries`
- What data and operations BELONG to this domain?
- What data and operations are EXCLUDED (belong to other domains)?
- Define the domain's boundary precisely.

### 4. `## Subdomains`
- List each subdomain (subfolder) with a 1–2 sentence description.
- Use a table format:
  | Subdomain | Description |
  |-----------|-------------|

### 5. `## Key Domain Entities`
- List the primary entities (Models) within this domain.
- For each entity: name, business definition, and its role in the domain.
- **DO NOT** describe database columns or Eloquent relationships.

### 6. `## Integration Points`
- Which other domains does this domain interact with?
- What Domain Events does it emit?
- What Domain Events does it consume?
- Use a Mermaid diagram if 3+ integration points exist.

### 7. `## Governance Rules`
- List the immutable business rules governing this domain.
- Example: "Posted General Ledger entries cannot be modified or deleted."

### 8. `## Documentation Scope`
- List all planned documentation pages for this domain.
- Reference the corresponding task IDs.
- Use a table:
  | Document | Task ID | Status |
  |----------|---------|--------|
