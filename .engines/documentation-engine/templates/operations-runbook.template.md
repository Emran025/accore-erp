# Operations Runbook Template

> **Template ID:** operations-runbook
> **Usage:** Documenting operational procedures, deployment strategies, and governance policies.
> **Scope:** One operational topic.
> **Word Target:** ~600 words

---

## Required Frontmatter

```yaml
---
title: "[Operations Topic Title]"
domain: "Operations"
subdomain: ""
tier: 5
status: draft
task_id: "[OPS-NNN]"
template: "operations-runbook"
version: "1.0.0"
created: "YYYY-MM-DD"
last_updated: "YYYY-MM-DD"
word_count: NNN
---
```

---

## Required Sections

### 1. `# [Operations Topic Title]`

### 2. `## Purpose`
- What operational need does this document address?
- Who is the primary audience (DevOps, DBA, Security, Auditor)?

### 3. `## Scope & Applicability`
- What environments does this apply to (production, staging, all)?
- What systems or components are involved?

### 4. `## Procedure`
- Step-by-step operational procedure.
- Use numbered list format.
- Include decision points and rollback steps.

### 5. `## Monitoring & Verification`
- How to verify the procedure was successful.
- What metrics or logs to check.

### 6. `## Failure Recovery`
- What to do if the procedure fails.
- Rollback instructions.
- Escalation contacts.

### 7. `## Compliance & Audit`
- What audit evidence does this procedure generate?
- Regulatory requirements addressed.

### 8. `## Change History`
- Log of significant changes to this procedure.
  | Date | Change | Author |
  |------|--------|--------|

### 9. `## Assumptions & Open Questions`
- Mandatory section.
