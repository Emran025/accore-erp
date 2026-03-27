# Commercial - RevenueReceivables

> **Bounded Context Schema & ERD**
> 8 Tables | Generated dynamically by ACCSYSTEM engine

---

## Tables List

- `ar_transactions`
- `invoice_items`
- `invoices`
- `revenues`
- `sales_return_items`
- `sales_returns`
- `unearned_revenue`
- `zatca_einvoices`

---

## Entity Relationship Diagram

```mermaid
erDiagram
    ar_transactions {
        bigint20unsigned id "PK,UK"
        bigint20unsigned customer_id "FK"
        varchar20 type 
        varchar50 voucher_number "FK"
        text description 
        varchar50 reference_type 
        bigint20unsigned reference_id 
        timestamp transaction_date 
        bigint20unsigned created_by "FK"
        tinyint1 is_deleted 
        timestamp deleted_at 
        timestamp created_at 
    }
    invoice_items {
        bigint20unsigned id "PK,UK"
        bigint20unsigned invoice_id "FK"
        bigint20unsigned product_id "FK"
        int11 quantity 
        varchar50 unit_type 
        decimal102 unit_price 
        decimal102 subtotal 
    }
    invoices {
        bigint20unsigned id "PK,UK"
        varchar50 invoice_number "UK"
        varchar50 voucher_number "FK"
        varchar20 payment_type 
        bigint20unsigned customer_id "FK"
        bigint20unsigned user_id "FK"
        tinyint1 is_reversed 
        datetime reversed_at 
        bigint20unsigned reversed_by "FK"
        timestamp created_at 
        timestamp updated_at 
        bigint20unsigned sales_representative_id "FK"
    }
    revenues {
        bigint20unsigned id "PK,UK"
        varchar255 source 
        varchar50 voucher_number "FK"
        timestamp revenue_date 
        text description 
        bigint20unsigned user_id "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    sales_return_items {
        bigint20unsigned id "PK,UK"
        bigint20unsigned sales_return_id "FK"
        bigint20unsigned invoice_item_id "FK"
        bigint20unsigned product_id "FK"
        int11 quantity 
        decimal152 unit_price 
        decimal152 subtotal 
        varchar255 unit_type 
    }
    sales_returns {
        bigint20unsigned id "PK,UK"
        varchar255 return_number "UK"
        bigint20unsigned invoice_id "FK"
        decimal152 total_amount 
        decimal152 subtotal 
        text reason 
        bigint20unsigned user_id "FK"
        varchar50 voucher_number "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    unearned_revenue {
        bigint20unsigned id "PK,UK"
        date receipt_date 
        decimal152 total_amount 
        int11 months 
        text description 
        varchar20 revenue_account_code 
        decimal152 recognized_amount 
        bigint20unsigned created_by 
        timestamp created_at 
        timestamp updated_at 
    }
    zatca_einvoices {
        bigint20unsigned id "PK,UK"
        bigint20unsigned invoice_id "FK,UK"
        text xml_content 
        varchar64 hash 
        text signed_xml 
        varchar255 qr_code 
        varchar255 zatca_uuid 
        text zatca_qr_code 
        varchar20 status 
        datetime signed_at 
        datetime submitted_at 
        timestamp created_at 
        timestamp updated_at 
    }
    ar_customers ||--o{ ar_transactions : "customer_id"
    universal_journals ||--o{ ar_transactions : "voucher_number"
    users ||--o{ ar_transactions : "created_by"
    invoices ||--o{ invoice_items : "invoice_id"
    products ||--o{ invoice_items : "product_id"
    universal_journals ||--o{ invoices : "voucher_number"
    ar_customers ||--o{ invoices : "customer_id"
    users ||--o{ invoices : "user_id"
    users ||--o{ invoices : "reversed_by"
    sales_representatives ||--o{ invoices : "sales_representative_id"
    universal_journals ||--o{ revenues : "voucher_number"
    users ||--o{ revenues : "user_id"
    sales_returns ||--o{ sales_return_items : "sales_return_id"
    invoice_items ||--o{ sales_return_items : "invoice_item_id"
    products ||--o{ sales_return_items : "product_id"
    invoices ||--o{ sales_returns : "invoice_id"
    users ||--o{ sales_returns : "user_id"
    universal_journals ||--o{ sales_returns : "voucher_number"
    invoices ||--o{ zatca_einvoices : "invoice_id"
```

---

## Data Dictionary

### Table: `ar_transactions`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `customer_id` | `bigint(20) unsigned` | No |  | IDX | -> `ar_customers.id` |
| `type` | `varchar(20)` | No |  |  |  |
| `voucher_number` | `varchar(50)` | Yes | `NULL` | IDX | -> `universal_journals.voucher_number` |
| `description` | `text` | Yes | `NULL` |  |  |
| `reference_type` | `varchar(50)` | Yes | `NULL` |  |  |
| `reference_id` | `bigint(20) unsigned` | Yes | `NULL` |  |  |
| `transaction_date` | `timestamp` | No | `current_timestamp()` |  |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `is_deleted` | `tinyint(1)` | No | `0` |  |  |
| `deleted_at` | `timestamp` | Yes | `NULL` |  |  |
| `created_at` | `timestamp` | No | `current_timestamp()` |  |  |

### Table: `invoice_items`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `invoice_id` | `bigint(20) unsigned` | No |  | IDX | -> `invoices.id` |
| `product_id` | `bigint(20) unsigned` | No |  | IDX | -> `products.id` |
| `quantity` | `int(11)` | No |  |  |  |
| `unit_type` | `varchar(50)` | No | `'main'` |  |  |
| `unit_price` | `decimal(10,2)` | No |  |  |  |
| `subtotal` | `decimal(10,2)` | No |  |  |  |

### Table: `invoices`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `invoice_number` | `varchar(50)` | No |  | *UK* |  |
| `voucher_number` | `varchar(50)` | Yes | `NULL` | IDX | -> `universal_journals.voucher_number` |
| `payment_type` | `varchar(20)` | No | `'cash'` |  |  |
| `customer_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `ar_customers.id` |
| `user_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `is_reversed` | `tinyint(1)` | No | `0` |  |  |
| `reversed_at` | `datetime` | Yes | `NULL` |  |  |
| `reversed_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |
| `sales_representative_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `sales_representatives.id` |

### Table: `revenues`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `source` | `varchar(255)` | No |  |  |  |
| `voucher_number` | `varchar(50)` | Yes | `NULL` | IDX | -> `universal_journals.voucher_number` |
| `revenue_date` | `timestamp` | No | `current_timestamp()` |  |  |
| `description` | `text` | Yes | `NULL` |  |  |
| `user_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `sales_return_items`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `sales_return_id` | `bigint(20) unsigned` | No |  | IDX | -> `sales_returns.id` |
| `invoice_item_id` | `bigint(20) unsigned` | No |  | IDX | -> `invoice_items.id` |
| `product_id` | `bigint(20) unsigned` | No |  | IDX | -> `products.id` |
| `quantity` | `int(11)` | No |  |  |  |
| `unit_price` | `decimal(15,2)` | No |  |  |  |
| `subtotal` | `decimal(15,2)` | No |  |  |  |
| `unit_type` | `varchar(255)` | No | `'sub'` |  |  |

### Table: `sales_returns`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `return_number` | `varchar(255)` | No |  | *UK* |  |
| `invoice_id` | `bigint(20) unsigned` | No |  | IDX | -> `invoices.id` |
| `total_amount` | `decimal(15,2)` | No |  |  |  |
| `subtotal` | `decimal(15,2)` | No |  |  |  |
| `reason` | `text` | Yes | `NULL` |  |  |
| `user_id` | `bigint(20) unsigned` | No |  | IDX | -> `users.id` |
| `voucher_number` | `varchar(50)` | Yes | `NULL` | IDX | -> `universal_journals.voucher_number` |
| `created_at` | `timestamp` | Yes | `NULL` | IDX |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `unearned_revenue`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `receipt_date` | `date` | No |  |  |  |
| `total_amount` | `decimal(15,2)` | No |  |  |  |
| `months` | `int(11)` | No |  |  |  |
| `description` | `text` | Yes | `NULL` |  |  |
| `revenue_account_code` | `varchar(20)` | Yes | `NULL` |  |  |
| `recognized_amount` | `decimal(15,2)` | No | `0.00` |  |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `zatca_einvoices`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `invoice_id` | `bigint(20) unsigned` | No |  | *UK* | -> `invoices.id` |
| `xml_content` | `text` | No |  |  |  |
| `hash` | `varchar(64)` | No |  | IDX |  |
| `signed_xml` | `text` | Yes | `NULL` |  |  |
| `qr_code` | `varchar(255)` | Yes | `NULL` |  |  |
| `zatca_uuid` | `varchar(255)` | Yes | `NULL` |  |  |
| `zatca_qr_code` | `text` | Yes | `NULL` |  |  |
| `status` | `varchar(20)` | No | `'generated'` | IDX |  |
| `signed_at` | `datetime` | Yes | `NULL` |  |  |
| `submitted_at` | `datetime` | Yes | `NULL` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

