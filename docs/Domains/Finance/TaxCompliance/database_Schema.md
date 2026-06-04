# Finance - TaxCompliance

> **Bounded Context Schema & ERD**
> 4 Tables | Generated dynamically by accoregine

---

## Tables List

- `tax_authorities`
- `tax_lines`
- `tax_rates`
- `tax_types`

---

## Entity Relationship Diagram

```mermaid
erDiagram
    tax_authorities {
        bigint20unsigned id "PK,UK"
        varchar20 code "UK"
        varchar100 name 
        varchar2 country_code 
        varchar255 adapter_class 
        longtext config 
        varchar20 connection_type 
        text connection_credentials 
        varchar255 endpoint_url 
        tinyint1 is_active 
        tinyint1 is_primary 
        timestamp created_at 
        timestamp updated_at 
    }
    tax_lines {
        bigint20unsigned id "PK,UK"
        varchar255 taxable_type 
        bigint20unsigned taxable_id 
        bigint20unsigned tax_authority_id "FK"
        bigint20unsigned tax_type_id "FK"
        bigint20unsigned tax_rate_id "FK"
        decimal84 rate 
        decimal154 taxable_amount 
        decimal154 tax_amount 
        varchar20 tax_type_code 
        varchar20 tax_authority_code 
        longtext metadata 
        int10unsigned line_order 
        timestamp created_at 
        timestamp updated_at 
    }
    tax_rates {
        bigint20unsigned id "PK,UK"
        bigint20unsigned tax_type_id "FK"
        decimal84 rate 
        decimal102 fixed_amount 
        date effective_from 
        date effective_to 
        varchar255 description 
        tinyint1 is_default 
        timestamp created_at 
        timestamp updated_at 
    }
    tax_types {
        bigint20unsigned id "PK,UK"
        bigint20unsigned tax_authority_id "FK,UK"
        varchar20 code "UK"
        varchar100 name 
        varchar20 gl_account_code 
        varchar20 calculation_type 
        longtext applicable_areas 
        tinyint1 is_active 
        timestamp created_at 
        timestamp updated_at 
    }
    tax_authorities ||--o{ tax_lines : "tax_authority_id"
    tax_types ||--o{ tax_lines : "tax_type_id"
    tax_rates ||--o{ tax_lines : "tax_rate_id"
    tax_types ||--o{ tax_rates : "tax_type_id"
    tax_authorities ||--o{ tax_types : "tax_authority_id"
```

---

## Data Dictionary

### Table: `tax_authorities`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `code` | `varchar(20)` | No |  | *UK* |  |
| `name` | `varchar(100)` | No |  |  |  |
| `country_code` | `varchar(2)` | No | `'SA'` |  |  |
| `adapter_class` | `varchar(255)` | Yes | `NULL` |  |  |
| `config` | `longtext` | Yes | `NULL` |  |  |
| `connection_type` | `varchar(20)` | No | `'push_api'` |  |  |
| `connection_credentials` | `text` | Yes | `NULL` |  |  |
| `endpoint_url` | `varchar(255)` | Yes | `NULL` |  |  |
| `is_active` | `tinyint(1)` | No | `1` |  |  |
| `is_primary` | `tinyint(1)` | No | `0` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `tax_lines`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `taxable_type` | `varchar(255)` | No |  | IDX |  |
| `taxable_id` | `bigint(20) unsigned` | No |  | IDX |  |
| `tax_authority_id` | `bigint(20) unsigned` | No |  | IDX | -> `tax_authorities.id` |
| `tax_type_id` | `bigint(20) unsigned` | No |  | IDX | -> `tax_types.id` |
| `tax_rate_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `tax_rates.id` |
| `rate` | `decimal(8,4)` | No | `0.0000` |  |  |
| `taxable_amount` | `decimal(15,4)` | No | `0.0000` |  |  |
| `tax_amount` | `decimal(15,4)` | No |  |  |  |
| `tax_type_code` | `varchar(20)` | No |  |  |  |
| `tax_authority_code` | `varchar(20)` | No |  |  |  |
| `metadata` | `longtext` | Yes | `NULL` |  |  |
| `line_order` | `int(10) unsigned` | No | `0` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `tax_rates`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `tax_type_id` | `bigint(20) unsigned` | No |  | IDX | -> `tax_types.id` |
| `rate` | `decimal(8,4)` | No | `0.0000` |  |  |
| `fixed_amount` | `decimal(10,2)` | No | `0.00` |  |  |
| `effective_from` | `date` | No |  | IDX |  |
| `effective_to` | `date` | Yes | `NULL` | IDX |  |
| `description` | `varchar(255)` | Yes | `NULL` |  |  |
| `is_default` | `tinyint(1)` | No | `0` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `tax_types`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `tax_authority_id` | `bigint(20) unsigned` | No |  | *UK* | -> `tax_authorities.id` |
| `code` | `varchar(20)` | No |  | *UK* |  |
| `name` | `varchar(100)` | No |  |  |  |
| `gl_account_code` | `varchar(20)` | Yes | `NULL` |  |  |
| `calculation_type` | `varchar(20)` | No | `'percentage'` |  |  |
| `applicable_areas` | `longtext` | Yes | `NULL` |  |  |
| `is_active` | `tinyint(1)` | No | `1` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

