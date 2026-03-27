# Task: FIN-002 — Double-Entry Core Model

---

## Metadata

| Field | Value |
|-------|-------|
| **Task ID** | FIN-002 |
| **Phase** | 2 |
| **Domain** | Finance |
| **Subdomain** | GeneralLedger |
| **Tier** | Domain |
| **Template** | `domain-standard` |
| **Output Path** | `/docs/Domains/Finance/GeneralLedger/Double_Entry_Core_Model.md` |
| **Page Count** | 1 |
| **Dependencies** | FIN-001 |

---

## Objective

Document the Double-Entry Bookkeeping core model implemented in the General Ledger subdomain. Explain the business rationale for double-entry, the entities involved, the lifecycle of a journal entry, and the immutability constraints governing posted entries.

---

## Strict Scope

### IN SCOPE
- Double-entry bookkeeping principle and its business purpose
- GeneralLedger and UniversalJournal entities
- Journal entry lifecycle (Draft → Posted)
- Debit/Credit balancing rules
- Relationship between journal entries and fiscal periods
- Immutability of posted entries

### OUT OF SCOPE
- Chart of Accounts structure (covered in FIN-003)
- Multi-currency handling (covered in FIN-005)
- Tax calculations (covered in FIN-007)
- Code implementation details

---

## Input Files / Folders

| Type | Path | Purpose |
|------|------|---------|
| Models | `backend/app/Domains/Finance/GeneralLedger/Models/GeneralLedger.php` | GL entity structure |
| Models | `backend/app/Domains/Finance/GeneralLedger/Models/UniversalJournal.php` | Journal entry structure |
| Models | `backend/app/Domains/Finance/GeneralLedger/Models/FiscalPeriod.php` | Period constraints |
| Services | `backend/app/Domains/Finance/GeneralLedger/Services/LedgerService.php` | Posting behavior |
| Actions | `backend/app/Domains/Finance/GeneralLedger/Actions/ListGlEntriesAction.php` | GL entry patterns |

---

## Forbidden Assumptions

1. Do NOT assume debit/credit field names — verify from Models.
2. Do NOT assume the journal entry lifecycle — verify from Actions/Services.
3. Do NOT describe Eloquent relationships — describe BUSINESS relationships.
4. Flag any inferred lifecycle states with `[ASSUMPTION]`.

---

## Quality Checklist

- [ ] Uses `domain-standard` template
- [ ] State machine diagram included (Mermaid)
- [ ] Double-entry principle explained for business audience
- [ ] Immutability constraint clearly stated
- [ ] Word count: 400–650
- [ ] Frontmatter complete
