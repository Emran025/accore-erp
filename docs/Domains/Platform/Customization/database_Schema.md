# Platform - Customization

> **Bounded Context Schema & ERD**
> 3 Tables | Generated dynamically by accoregine

---

## Tables List

- `document_template_histories`
- `document_templates`
- `permission_templates`

---

## Entity Relationship Diagram

```mermaid
erDiagram
    document_template_histories {
        bigint20unsigned id "PK,UK"
        bigint20unsigned document_template_id "FK"
        longtext body_html 
        bigint20unsigned created_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    document_templates {
        bigint20unsigned id "PK,UK"
        varchar50 template_key "UK"
        varchar255 template_name_ar 
        varchar255 template_name_en 
        varchar255 template_type 
        longtext body_html 
        longtext editable_fields 
        varchar500 description 
        tinyint1 is_active 
        bigint20unsigned created_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    permission_templates {
        bigint20unsigned id "PK,UK"
        varchar255 template_name 
        varchar255 template_key "UK"
        text description 
        longtext permissions 
        tinyint1 is_active 
        bigint20unsigned created_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    document_templates ||--o{ document_template_histories : "document_template_id"
    users ||--o{ document_template_histories : "created_by"
    users ||--o{ document_templates : "created_by"
    users ||--o{ permission_templates : "created_by"
```

---

## Data Dictionary

### Table: `document_template_histories`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `document_template_id` | `bigint(20) unsigned` | No |  | IDX | -> `document_templates.id` |
| `body_html` | `longtext` | No |  |  |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `document_templates`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `template_key` | `varchar(50)` | No |  | *UK* |  |
| `template_name_ar` | `varchar(255)` | No |  |  |  |
| `template_name_en` | `varchar(255)` | Yes | `NULL` |  |  |
| `template_type` | `varchar(255)` | No | `'other'` |  |  |
| `body_html` | `longtext` | No |  |  |  |
| `editable_fields` | `longtext` | Yes | `NULL` |  |  |
| `description` | `varchar(500)` | Yes | `NULL` |  |  |
| `is_active` | `tinyint(1)` | No | `1` |  |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `permission_templates`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `template_name` | `varchar(255)` | No |  |  |  |
| `template_key` | `varchar(255)` | No |  | *UK* |  |
| `description` | `text` | Yes | `NULL` |  |  |
| `permissions` | `longtext` | No |  |  |  |
| `is_active` | `tinyint(1)` | No | `1` |  |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

