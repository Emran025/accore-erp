# EnterpriseCore - SystemOverview

> **Bounded Context Schema & ERD**
> 11 Tables | Generated dynamically by ACCSYSTEM engine

---

## Tables List

- `batch_processing`
- `cache`
- `cache_locks`
- `document_sequences`
- `documents`
- `migrations`
- `nr_group_interval_assignments`
- `nr_groups`
- `nr_intervals`
- `nr_objects`
- `settings`

---

## Entity Relationship Diagram

```mermaid
erDiagram
    batch_processing {
        bigint20unsigned id "PK,UK"
        varchar100 batch_name 
        varchar50 batch_type 
        text description 
        varchar20 status 
        int11 total_items 
        datetime started_at 
        datetime completed_at 
        bigint20unsigned created_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    cache {
        varchar255 key "PK,UK"
        mediumtext value 
        int11 expiration 
    }
    cache_locks {
        varchar255 key "PK,UK"
        varchar255 owner 
        int11 expiration 
    }
    document_sequences {
        bigint20unsigned id "PK,UK"
        varchar50 document_type "UK"
        varchar10 prefix 
        int11 current_number 
        varchar50 format 
        timestamp updated_at 
    }
    documents {
        bigint20unsigned id "PK,UK"
        varchar255 document_number "UK"
        varchar255 document_type 
        varchar255 title 
        text description 
        varchar500 file_path 
        varchar255 file_name 
        varchar100 mime_type 
        int11 file_size 
        date issue_date 
        date expiration_date 
        varchar255 status 
        tinyint1 is_verified 
        bigint20unsigned verified_by "FK"
        timestamp verified_at 
        bigint20unsigned uploaded_by "FK"
        varchar255 documentable_type 
        bigint20unsigned documentable_id 
        timestamp created_at 
        timestamp updated_at 
        timestamp deleted_at 
    }
    migrations {
        int10unsigned id "PK,UK"
        varchar255 migration 
        int11 batch 
    }
    nr_group_interval_assignments {
        bigint20unsigned id "PK,UK"
        bigint20unsigned nr_object_id "FK"
        bigint20unsigned nr_group_id "FK,UK"
        bigint20unsigned nr_interval_id "FK,UK"
        tinyint1 is_active 
        bigint20unsigned created_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    nr_groups {
        bigint20unsigned id "PK,UK"
        bigint20unsigned nr_object_id "FK,UK"
        varchar20 code "UK"
        varchar255 name 
        varchar255 name_en 
        varchar255 description 
        tinyint1 is_active 
        bigint20unsigned created_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    nr_intervals {
        bigint20unsigned id "PK,UK"
        bigint20unsigned nr_object_id "FK,UK"
        varchar20 code "UK"
        varchar255 description 
        bigint20unsigned from_number 
        bigint20unsigned to_number 
        bigint20unsigned current_number 
        tinyint1 is_external 
        tinyint1 is_active 
        bigint20unsigned created_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    nr_objects {
        bigint20unsigned id "PK,UK"
        varchar50 object_type "UK"
        varchar255 name 
        varchar255 name_en 
        varchar255 description 
        tinyint3unsigned number_length 
        varchar10 prefix 
        tinyint1 is_active 
        bigint20unsigned created_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    settings {
        varchar50 setting_key "PK,UK"
        text setting_value 
        timestamp updated_at 
    }
    users ||--o{ batch_processing : "created_by"
    users ||--o{ documents : "verified_by"
    users ||--o{ documents : "uploaded_by"
    nr_objects ||--o{ nr_group_interval_assignments : "nr_object_id"
    nr_groups ||--o{ nr_group_interval_assignments : "nr_group_id"
    nr_intervals ||--o{ nr_group_interval_assignments : "nr_interval_id"
    users ||--o{ nr_group_interval_assignments : "created_by"
    nr_objects ||--o{ nr_groups : "nr_object_id"
    users ||--o{ nr_groups : "created_by"
    nr_objects ||--o{ nr_intervals : "nr_object_id"
    users ||--o{ nr_intervals : "created_by"
    users ||--o{ nr_objects : "created_by"
```

---

## Data Dictionary

### Table: `batch_processing`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `batch_name` | `varchar(100)` | No |  |  |  |
| `batch_type` | `varchar(50)` | No |  |  |  |
| `description` | `text` | Yes | `NULL` |  |  |
| `status` | `varchar(20)` | No | `'pending'` |  |  |
| `total_items` | `int(11)` | No | `0` |  |  |
| `started_at` | `datetime` | Yes | `NULL` |  |  |
| `completed_at` | `datetime` | Yes | `NULL` |  |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `cache`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `key` | `varchar(255)` | No |  | **PK** |  |
| `value` | `mediumtext` | No |  |  |  |
| `expiration` | `int(11)` | No |  |  |  |

### Table: `cache_locks`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `key` | `varchar(255)` | No |  | **PK** |  |
| `owner` | `varchar(255)` | No |  |  |  |
| `expiration` | `int(11)` | No |  |  |  |

### Table: `document_sequences`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `document_type` | `varchar(50)` | No |  | *UK* |  |
| `prefix` | `varchar(10)` | No | `''` |  |  |
| `current_number` | `int(11)` | No | `0` |  |  |
| `format` | `varchar(50)` | No | `'{PREFIX}-{NUMBER}'` |  |  |
| `updated_at` | `timestamp` | No | `current_timestamp()` |  |  |

### Table: `documents`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `document_number` | `varchar(255)` | Yes | `NULL` | *UK* |  |
| `document_type` | `varchar(255)` | No |  |  |  |
| `title` | `varchar(255)` | No |  |  |  |
| `description` | `text` | Yes | `NULL` |  |  |
| `file_path` | `varchar(500)` | No |  |  |  |
| `file_name` | `varchar(255)` | No |  |  |  |
| `mime_type` | `varchar(100)` | Yes | `NULL` |  |  |
| `file_size` | `int(11)` | Yes | `NULL` |  |  |
| `issue_date` | `date` | Yes | `NULL` |  |  |
| `expiration_date` | `date` | Yes | `NULL` |  |  |
| `status` | `varchar(255)` | No | `'active'` |  |  |
| `is_verified` | `tinyint(1)` | No | `0` |  |  |
| `verified_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `verified_at` | `timestamp` | Yes | `NULL` |  |  |
| `uploaded_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `documentable_type` | `varchar(255)` | Yes | `NULL` | IDX |  |
| `documentable_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |
| `deleted_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `migrations`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `int(10) unsigned` | No |  | **PK** |  |
| `migration` | `varchar(255)` | No |  |  |  |
| `batch` | `int(11)` | No |  |  |  |

### Table: `nr_group_interval_assignments`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `nr_object_id` | `bigint(20) unsigned` | No |  | IDX | -> `nr_objects.id` |
| `nr_group_id` | `bigint(20) unsigned` | No |  | *UK* | -> `nr_groups.id` |
| `nr_interval_id` | `bigint(20) unsigned` | No |  | *UK*, IDX | -> `nr_intervals.id` |
| `is_active` | `tinyint(1)` | No | `1` |  |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `nr_groups`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `nr_object_id` | `bigint(20) unsigned` | No |  | *UK* | -> `nr_objects.id` |
| `code` | `varchar(20)` | No |  | *UK* |  |
| `name` | `varchar(255)` | No |  |  |  |
| `name_en` | `varchar(255)` | Yes | `NULL` |  |  |
| `description` | `varchar(255)` | Yes | `NULL` |  |  |
| `is_active` | `tinyint(1)` | No | `1` |  |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `nr_intervals`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `nr_object_id` | `bigint(20) unsigned` | No |  | *UK* | -> `nr_objects.id` |
| `code` | `varchar(20)` | No |  | *UK* |  |
| `description` | `varchar(255)` | Yes | `NULL` |  |  |
| `from_number` | `bigint(20) unsigned` | No |  |  |  |
| `to_number` | `bigint(20) unsigned` | No |  |  |  |
| `current_number` | `bigint(20) unsigned` | No | `0` |  |  |
| `is_external` | `tinyint(1)` | No | `0` |  |  |
| `is_active` | `tinyint(1)` | No | `1` |  |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `nr_objects`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `object_type` | `varchar(50)` | No |  | *UK* |  |
| `name` | `varchar(255)` | No |  |  |  |
| `name_en` | `varchar(255)` | Yes | `NULL` |  |  |
| `description` | `varchar(255)` | Yes | `NULL` |  |  |
| `number_length` | `tinyint(3) unsigned` | No | `8` |  |  |
| `prefix` | `varchar(10)` | Yes | `NULL` |  |  |
| `is_active` | `tinyint(1)` | No | `1` |  |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `settings`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `setting_key` | `varchar(50)` | No |  | **PK** |  |
| `setting_value` | `text` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | No | `current_timestamp()` |  |  |

