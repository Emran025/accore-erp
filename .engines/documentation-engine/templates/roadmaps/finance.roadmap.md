# Finance Domain Roadmap

> **Domain:** Finance
> **Bounded Context:** `backend/app/Domains/Finance/`
> **Phase:** 2 (Core Financial & Operational)
> **Priority:** HIGHEST — Finance is the irreversible core of the ERP.

---

## 1. Domain Summary

The Finance domain is the absolute core of the accore ERP. It governs the General Ledger, Chart of Accounts, fiscal periods, tax compliance, treasury management, foreign exchange, management accounting, and financial auditing. No financial record may be deleted — all corrections are performed via offset entries. This domain defines the immutability contract that all other domains must respect.

---

## 2. Subdomains (from codebase)

| Subdomain | Codebase Path | Description |
|-----------|--------------|-------------|
| GeneralLedger | `Finance/GeneralLedger/` | Double-entry core, COA, fiscal periods, journal entries, trial balance |
| AuditCompliance | `Finance/AuditCompliance/` | Financial auditing, compliance reporting |
| ForeignExchange | `Finance/ForeignExchange/` | Currency rates, revaluation, multi-currency transactions |
| ManagementAccounting | `Finance/ManagementAccounting/` | Cost centers, budgets, internal cost allocation |
| TaxCompliance | `Finance/TaxCompliance/` | Tax jurisdictions, calculations, reporting |
| Treasury | `Finance/Treasury/` | Cash management, bank reconciliation, liquidity |

---

## 3. Task Execution Order

| Order | Task ID | Title | Template | Input Path | Output Path | Pages |
|-------|---------|-------|----------|------------|-------------|-------|
| 1 | FIN-001 | Finance Domain Overview | domain-overview | `Finance/` (all) | `/docs/Domains/Finance/Overview.md` | 1 |
| 2 | FIN-002 | Double-Entry Core Model | domain-standard | `Finance/GeneralLedger/` | `/docs/Domains/Finance/GeneralLedger/Double_Entry_Core_Model.md` | 1 |
| 3 | FIN-003 | Chart of Accounts Governance | domain-standard | `Finance/GeneralLedger/` | `/docs/Domains/Finance/GeneralLedger/Chart_Of_Accounts_Governance.md` | 1 |
| 4 | FIN-004 | Financial Auditing | domain-standard | `Finance/AuditCompliance/` | `/docs/Domains/Finance/AuditCompliance/Financial_Auditing.md` | 1 |
| 5 | FIN-005 | Currency Revaluation & Rates | domain-standard | `Finance/ForeignExchange/` | `/docs/Domains/Finance/ForeignExchange/Currency_Revaluation_And_Rates.md` | 1 |
| 6 | FIN-006 | Cost Centers & Budgets | domain-standard | `Finance/ManagementAccounting/` | `/docs/Domains/Finance/ManagementAccounting/Cost_Centers_And_Budgets.md` | 1 |
| 7 | FIN-007 | Tax Jurisdictions & Calculations | domain-standard | `Finance/TaxCompliance/` | `/docs/Domains/Finance/TaxCompliance/Tax_Jurisdictions_And_Calculations.md` | 1 |
| 8 | FIN-008 | Cash Management & Reconciliation | domain-standard | `Finance/Treasury/` | `/docs/Domains/Finance/Treasury/Cash_Management_And_Reconciliation.md` | 1 |

---

## 4. Dependencies

- **Depends on (must complete first):**
  - `SYS-002` — Bounded Context Map (Phase 1)
  - `SYS-004` — Financial Data Immutability (Phase 1)
  - `ARCH-003` — Action & Service Layer (Phase 1)

- **Blocks (cannot start until Finance completes):**
  - `COM-004` — Accounts Receivable (references GL)
  - `SC-003` — Accounts Payable (references GL)
  - `AST-002` — Depreciation (posts to GL)
  - `HC-003` — Payroll Execution (posts to GL)

---

## 5. Source Code Inventory

### GeneralLedger Key Files
- **Actions:** `CreateChartOfAccountAction`, `CreateFiscalPeriodAction`, `CloseFiscalPeriodAction`, `LockFiscalPeriodAction`, `ListGlEntriesAction`, `GetTrialBalanceAction`, `GetAccountBalanceHistoryAction`, `CreateRecurringTransactionAction`, `ProcessRecurringTransactionAction`
- **Models:** `ChartOfAccount`, `FiscalPeriod`, `GeneralLedger`, `UniversalJournal`
- **Services:** `LedgerService`, `ChartOfAccountsMappingService`, `MultiCurrencyLedgerService`

---

## 6. Total Page Count

**8 pages** (foundational pass)

> **Expansion Note:** Finance will grow to ~30+ pages as detailed lifecycle documents, constraint documents, and integration event specifications are added in later increments.

---

## 7. Review Gate

All 8 Finance tasks MUST be reviewed and approved before:
1. Moving `active_domain.md` to the next domain (EnterpriseCore)
2. Executing any task that depends on Finance documents
