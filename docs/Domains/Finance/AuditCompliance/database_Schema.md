# Finance - AuditCompliance

> **Bounded Context Schema & ERD**
> 1 Tables | Generated dynamically by ACCSYSTEM engine

---

## Tables List

- `reconciliations`

---

## Entity Relationship Diagram

```mermaid
erDiagram
    reconciliations {
        bigint20unsigned id "PK,UK"
        varchar20 account_code 
        date reconciliation_date 
        decimal152 ledger_balance 
        decimal152 physical_balance 
        decimal152 difference 
        varchar20 status 
        text notes 
        text adjustment_notes 
        bigint20unsigned reconciled_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    users ||--o{ reconciliations : "reconciled_by"
```

---

## Data Dictionary

### Table: `reconciliations`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `account_code` | `varchar(20)` | No |  | IDX |  |
| `reconciliation_date` | `date` | No |  | IDX |  |
| `ledger_balance` | `decimal(15,2)` | No |  |  |  |
| `physical_balance` | `decimal(15,2)` | No |  |  |  |
| `difference` | `decimal(15,2)` | No |  |  |  |
| `status` | `varchar(20)` | No | `'unreconciled'` | IDX |  |
| `notes` | `text` | Yes | `NULL` |  |  |
| `adjustment_notes` | `text` | Yes | `NULL` |  |  |
| `reconciled_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

