# Task: FIN-004 — GL Account Reconciliation & Financial Controls

---

## Metadata

| Field | Value |
|-------|-------|
| **Task ID** | FIN-004 |
| **Phase** | 2 |
| **Domain** | Finance |
| **Subdomain** | GeneralLedger |
| **Tier** | Domain |
| **Template** | `domain-standard` |
| **Output Path** | `/docs/Domains/Finance/GeneralLedger/GL_Account_Reconciliation_And_Controls.md` |
| **Page Count** | 1 |
| **Dependencies** | FIN-002, FIN-003 |

---

## Objective

Document GL account reconciliation processes, control procedures, and financial governance mechanisms within the General Ledger subdomain. Explain how the system enforces account balance integrity, supports variance investigation, and maintains segregation of duties for GL posting.

---

## Strict Scope

### IN SCOPE
- GL account balance verification and reconciliation workflows
- Trial balance generation and variance management
- GL posting controls and authorization rules
- Account lock/unlock procedures per fiscal period
- Recurring transaction processing and scheduling
- GL balance reporting and account status tracking

### OUT OF SCOPE
- System-wide audit logging (covered in EC-004)
- Tax audits and compliance (covered in FIN-007)
- External audit execution (operations responsibility)
- Code implementation details

---

## Input Files / Folders

| Type | Path | Purpose |
|------|------|---------|
| Models | `backend/app/Domains/Finance/GeneralLedger/Models/GeneralLedger.php` | GL posting structure |
| Models | `backend/app/Domains/Finance/GeneralLedger/Models/ChartOfAccount.php` | Account reconciliation entity |
| Models | `backend/app/Domains/Finance/GeneralLedger/Models/FiscalPeriod.php` | Period-based posting controls |
| Services | `backend/app/Domains/Finance/GeneralLedger/Services/LedgerService.php` | Balance verification logic |
| Actions | `backend/app/Domains/Finance/GeneralLedger/Actions/` | GL posting and control actions |

---

## Forbidden Assumptions

1. Do NOT assume standard reconciliation processes — verify from Services/Actions.
2. Do NOT assume posting authorization controls exist — verify from code or flag as `[ASSUMPTION]`.
3. Do NOT assume period-based GL locking — verify from FiscalPeriod model.
4. Do NOT describe code; explain business control flows and governance.

---

## Quality Checklist

- [ ] Uses `domain-standard` template
- [ ] GL posting control flow diagram included (Mermaid)
- [ ] Account reconciliation lifecycle explained
- [ ] Period-based GL posting constraints stated
- [ ] Word count: 400–650
- [ ] Frontmatter complete
