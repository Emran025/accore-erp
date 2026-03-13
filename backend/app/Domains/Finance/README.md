# Domain 03: Financial Management (الإدارة المالية)

> General Ledger, Treasury, and Tax.

## Capabilities

| Capability | Feature Groups |
|---|---|
| **GeneralLedger** | Trial Balance, Entries, Account Activity, Account Details |
| **JournalVouchers** | Create, Post, View, Delete |
| **FiscalPeriods** | Create, Close, Lock, Unlock |
| **ChartOfAccounts** | Accounts CRUD, Balances |
| **AccrualAccounting** | Accrual Entries |
| **Treasury** | Bank Reconciliation, Currencies, Currency Policies, Expenses |
| **CostProfitCenters** | Cost Centers, Profit Centers, Summary |
| **Revenues** | Revenue Entries |
| **RecurringTransactions** | Scheduled Transactions, Processing |

## Directory Convention

```
03-Finance/
├── GeneralLedger/
│   ├── Actions/
│   ├── DTOs/
│   └── Services/
├── JournalVouchers/
│   ├── Actions/
│   ├── DTOs/
│   └── Services/
├── Treasury/
│   ├── Actions/
│   ├── DTOs/
│   └── Services/
├── TaxCompliance/
│   ├── Actions/
│   ├── DTOs/
│   ├── Contracts/
│   └── Services/
└── CostProfitCenters/
    ├── Actions/
    ├── DTOs/
    └── Services/
```
