# Task: FIN-003 — Chart of Accounts Governance

---

## Metadata

| Field | Value |
|-------|-------|
| **Task ID** | FIN-003 |
| **Phase** | 2 |
| **Domain** | Finance |
| **Subdomain** | GeneralLedger |
| **Tier** | Domain |
| **Template** | `domain-standard` |
| **Output Path** | `/docs/Domains/Finance/GeneralLedger/Chart_Of_Accounts_Governance.md` |
| **Page Count** | 1 |
| **Dependencies** | FIN-002 |

---

## Objective

Document the Chart of Accounts governance model. Explain the hierarchical account structure, account types, mapping strategies, and the rules governing account creation, modification, and deactivation.

---

## Input Files / Folders

| Type | Path | Purpose |
|------|------|---------|
| Models | `backend/app/Domains/Finance/GeneralLedger/Models/ChartOfAccount.php` | Account structure |
| Actions | `backend/app/Domains/Finance/GeneralLedger/Actions/CreateChartOfAccountAction.php` | Account creation rules |
| Actions | `backend/app/Domains/Finance/GeneralLedger/Actions/UpdateChartOfAccountAction.php` | Modification rules |
| Actions | `backend/app/Domains/Finance/GeneralLedger/Actions/DeleteChartOfAccountAction.php` | Deletion constraints |
| Actions | `backend/app/Domains/Finance/GeneralLedger/Actions/ListChartOfAccountsAction.php` | Listing/hierarchy |
| Actions | `backend/app/Domains/Finance/GeneralLedger/Actions/GetChartOfAccountBalancesAction.php` | Balance queries |
| Services | `backend/app/Domains/Finance/GeneralLedger/Services/ChartOfAccountsMappingService.php` | Mapping logic |

---

## Forbidden Assumptions

1. Do NOT assume a standard COA template — verify the actual account structure from Model.
2. Do NOT assume accounts can be deleted — verify from `DeleteChartOfAccountAction`.
