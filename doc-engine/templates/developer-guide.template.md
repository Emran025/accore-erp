# Developer Guide Template

> **Template ID:** developer-guide
> **Usage:** Documenting developer-facing instructions, patterns, and contribution guidelines.
> **Scope:** One development topic or workflow.
> **Word Target:** ~600 words
> **Note:** This is the ONLY template that permits code blocks.

---

## Required Frontmatter

```yaml
---
title: "[Developer Guide Title]"
domain: "Developer"
subdomain: ""
tier: 4
status: draft
task_id: "[DEV-NNN]"
template: "developer-guide"
version: "1.0.0"
created: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"
word_count: NNN
---
```

---

## Required Sections

### 1. `# [Developer Guide Title]`

### 2. `## Objective`
- What will the developer learn or be able to do after reading this guide?

### 3. `## Prerequisites`
- What knowledge, tools, or access does the developer need?

### 4. `## Conceptual Overview`
- Brief explanation of the underlying pattern or architecture.
- Link to relevant Architecture Tier documents.

### 5. `## Step-by-Step Instructions`
- Numbered steps with clear, actionable instructions.
- Code examples using PHP/Laravel syntax where appropriate.
- Each step should explain WHAT to do AND WHY.

### 6. `## Code Examples`
- Concrete, working code snippets.
- Use fenced code blocks with language identifiers.
- Annotate with inline comments.

### 7. `## Common Mistakes`
- List 3–5 common pitfalls and how to avoid them.

### 8. `## Testing`
- How should the developer verify their implementation?
- What tests should be written?

### 9. `## Related Documentation`
- Links to related Architecture, API, or Domain documents.
