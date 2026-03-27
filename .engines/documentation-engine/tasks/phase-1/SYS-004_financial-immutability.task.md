# Task: SYS-004 — Financial Data Immutability

---

## Metadata

| Field | Value |
|-------|-------|
| **Task ID** | SYS-004 |
| **Phase** | 1 |
| **Domain** | System |
| **Tier** | 1 |
| **Template** | `constraint` |
| **Output Path** | `/docs/System/Financial_Data_Immutability.md` |
| **Page Count** | 1 |
| **Dependencies** | SYS-001, SYS-003 |

---

## Objective

Document the Financial Data Immutability doctrine — the core principle that posted financial records cannot be modified or deleted, and all corrections must be made via offset entries. This is the most critical constraint in the entire ERP.

---

## Strict Scope

### IN SCOPE
- Definition of immutability in the financial context
- Which entities are subject to immutability (journal entries, posted invoices, GL entries)
- How corrections are handled (offset/reversal entries)
- Fiscal period locking and its relationship to immutability
- Audit implications

### OUT OF SCOPE
- Code-level enforcement mechanisms (Action/Service internals)
- Database triggers or migration details
- Non-financial data immutability

---

## Input Files / Folders

| Type | Path | Purpose |
|------|------|---------|
| Models | `backend/app/Domains/Finance/GeneralLedger/Models/` | GL, Journal, FiscalPeriod structure |
| Actions | `backend/app/Domains/Finance/GeneralLedger/Actions/` | Lock/Close period behavior |
| Services | `backend/app/Domains/Finance/GeneralLedger/Services/LedgerService.php` | Posting behavior |

---

## Forbidden Assumptions

1. Do NOT assume any entity is mutable unless the code explicitly allows modification.
2. Do NOT describe code internals — describe the business PRINCIPLE.
3. Flag any inferred immutability rules with `[ASSUMPTION]`.

---

## Quality Checklist

- [ ] Uses `constraint` template
- [ ] Word count: 400–650
- [ ] Immutability defined clearly for business audience
- [ ] Correction mechanism described
- [ ] Audit implications addressed
- [ ] Frontmatter complete
