# Assets - AssetLifecycle

> **Bounded Context Schema & ERD**
> 3 Tables | Generated dynamically by accoregine

---

## Tables List

- `asset_depreciation`
- `assets`
- `employee_assets`

---

## Entity Relationship Diagram

```mermaid
erDiagram
    asset_depreciation {
        bigint20unsigned id "PK,UK"
        bigint20unsigned asset_id "FK"
        date depreciation_date 
        decimal152 depreciation_amount 
        decimal152 accumulated_depreciation 
        decimal152 book_value 
        bigint20unsigned fiscal_period_id "FK"
        bigint20unsigned created_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    assets {
        bigint20unsigned id "PK,UK"
        varchar255 name 
        decimal122 purchase_value 
        decimal152 salvage_value 
        int11 useful_life_years 
        varchar255 depreciation_method 
        decimal152 accumulated_depreciation 
        date purchase_date 
        decimal52 depreciation_rate 
        text description 
        varchar50 status 
        tinyint1 is_active 
        bigint20unsigned created_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    employee_assets {
        bigint20unsigned id "PK,UK"
        bigint20unsigned employee_id "FK"
        bigint20unsigned inventory_asset_id "FK"
        varchar50 asset_code "UK"
        varchar255 asset_name 
        enumlaptopphonevehic asset_type 
        varchar100 serial_number 
        varchar100 qr_code 
        date allocation_date 
        date return_date 
        enumallocatedreturne status 
        enumgooddamagedneeds condition_on_return 
        text condition_notes 
        text notes 
        bigint20unsigned cost_center_id "FK"
        bigint20unsigned project_id 
        date next_maintenance_date 
        text maintenance_notes 
        varchar500 digital_signature_path 
        bigint20unsigned created_by "FK"
        timestamp created_at 
        timestamp updated_at 
        timestamp deleted_at 
    }
    assets ||--o{ asset_depreciation : "asset_id"
    fiscal_periods ||--o{ asset_depreciation : "fiscal_period_id"
    users ||--o{ asset_depreciation : "created_by"
    users ||--o{ assets : "created_by"
    employees ||--o{ employee_assets : "employee_id"
    assets ||--o{ employee_assets : "inventory_asset_id"
    chart_of_accounts ||--o{ employee_assets : "cost_center_id"
    users ||--o{ employee_assets : "created_by"
```

---

## Data Dictionary

### Table: `asset_depreciation`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `asset_id` | `bigint(20) unsigned` | No |  | IDX | -> `assets.id` |
| `depreciation_date` | `date` | No |  | IDX |  |
| `depreciation_amount` | `decimal(15,2)` | No |  |  |  |
| `accumulated_depreciation` | `decimal(15,2)` | No |  |  |  |
| `book_value` | `decimal(15,2)` | No |  |  |  |
| `fiscal_period_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `fiscal_periods.id` |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `assets`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `name` | `varchar(255)` | No |  |  |  |
| `purchase_value` | `decimal(12,2)` | No |  |  |  |
| `salvage_value` | `decimal(15,2)` | No | `0.00` |  |  |
| `useful_life_years` | `int(11)` | No | `5` |  |  |
| `depreciation_method` | `varchar(255)` | No | `'straight_line'` |  |  |
| `accumulated_depreciation` | `decimal(15,2)` | No | `0.00` |  |  |
| `purchase_date` | `date` | No |  |  |  |
| `depreciation_rate` | `decimal(5,2)` | No | `0.00` |  |  |
| `description` | `text` | Yes | `NULL` |  |  |
| `status` | `varchar(50)` | No | `'active'` |  |  |
| `is_active` | `tinyint(1)` | No | `1` |  |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `employee_assets`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `employee_id` | `bigint(20) unsigned` | No |  | IDX | -> `employees.id` |
| `inventory_asset_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `assets.id` |
| `asset_code` | `varchar(50)` | No |  | *UK* |  |
| `asset_name` | `varchar(255)` | No |  |  |  |
| `asset_type` | `enum('laptop','phone','vehicle','key','equipment','other')` | No | `'other'` |  |  |
| `serial_number` | `varchar(100)` | Yes | `NULL` |  |  |
| `qr_code` | `varchar(100)` | Yes | `NULL` |  |  |
| `allocation_date` | `date` | No |  |  |  |
| `return_date` | `date` | Yes | `NULL` |  |  |
| `status` | `enum('allocated','returned','maintenance','lost','damaged')` | No | `'allocated'` |  |  |
| `condition_on_return` | `enum('good','damaged','needs_repair')` | Yes | `NULL` |  |  |
| `condition_notes` | `text` | Yes | `NULL` |  |  |
| `notes` | `text` | Yes | `NULL` |  |  |
| `cost_center_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `chart_of_accounts.id` |
| `project_id` | `bigint(20) unsigned` | Yes | `NULL` |  |  |
| `next_maintenance_date` | `date` | Yes | `NULL` |  |  |
| `maintenance_notes` | `text` | Yes | `NULL` |  |  |
| `digital_signature_path` | `varchar(500)` | Yes | `NULL` |  |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |
| `deleted_at` | `timestamp` | Yes | `NULL` |  |  |

