# Finance - ManagementAccounting

> **Bounded Context Schema & ERD**
> 2 Tables | Generated dynamically by ACCSYSTEM engine

---

## Tables List

- `cost_centers`
- `profit_centers`

---

## Entity Relationship Diagram

```mermaid
erDiagram
    cost_centers {
        bigint20unsigned id "PK,UK"
        char36 structure_node_uuid 
        varchar20 code "UK"
        varchar255 name 
        varchar255 name_en 
        bigint20unsigned parent_id "FK"
        bigint20unsigned account_id "FK"
        bigint20unsigned manager_id "FK"
        decimal152 budget 
        varchar30 type 
        text description 
        tinyint1 is_active 
        bigint20unsigned created_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    profit_centers {
        bigint20unsigned id "PK,UK"
        char36 structure_node_uuid 
        varchar20 code "UK"
        varchar255 name 
        varchar255 name_en 
        bigint20unsigned parent_id "FK"
        bigint20unsigned revenue_account_id "FK"
        bigint20unsigned expense_account_id "FK"
        bigint20unsigned manager_id "FK"
        decimal152 revenue_target 
        decimal152 expense_budget 
        varchar30 type 
        text description 
        tinyint1 is_active 
        bigint20unsigned created_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    cost_centers ||--o{ cost_centers : "parent_id"
    chart_of_accounts ||--o{ cost_centers : "account_id"
    employees ||--o{ cost_centers : "manager_id"
    users ||--o{ cost_centers : "created_by"
    profit_centers ||--o{ profit_centers : "parent_id"
    chart_of_accounts ||--o{ profit_centers : "revenue_account_id"
    chart_of_accounts ||--o{ profit_centers : "expense_account_id"
    employees ||--o{ profit_centers : "manager_id"
    users ||--o{ profit_centers : "created_by"
```

---

## Data Dictionary

### Table: `cost_centers`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `structure_node_uuid` | `char(36)` | Yes | `NULL` | IDX |  |
| `code` | `varchar(20)` | No |  | IDX, *UK* |  |
| `name` | `varchar(255)` | No |  |  |  |
| `name_en` | `varchar(255)` | Yes | `NULL` |  |  |
| `parent_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `cost_centers.id` |
| `account_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `chart_of_accounts.id` |
| `manager_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `employees.id` |
| `budget` | `decimal(15,2)` | Yes | `NULL` |  |  |
| `type` | `varchar(30)` | No | `'operational'` |  |  |
| `description` | `text` | Yes | `NULL` |  |  |
| `is_active` | `tinyint(1)` | No | `1` | IDX |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `profit_centers`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `structure_node_uuid` | `char(36)` | Yes | `NULL` | IDX |  |
| `code` | `varchar(20)` | No |  | IDX, *UK* |  |
| `name` | `varchar(255)` | No |  |  |  |
| `name_en` | `varchar(255)` | Yes | `NULL` |  |  |
| `parent_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `profit_centers.id` |
| `revenue_account_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `chart_of_accounts.id` |
| `expense_account_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `chart_of_accounts.id` |
| `manager_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `employees.id` |
| `revenue_target` | `decimal(15,2)` | Yes | `NULL` |  |  |
| `expense_budget` | `decimal(15,2)` | Yes | `NULL` |  |  |
| `type` | `varchar(30)` | No | `'business_unit'` |  |  |
| `description` | `text` | Yes | `NULL` |  |  |
| `is_active` | `tinyint(1)` | No | `1` | IDX |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

