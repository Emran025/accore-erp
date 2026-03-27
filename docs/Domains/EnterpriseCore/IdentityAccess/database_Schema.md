# EnterpriseCore - IdentityAccess

> **Bounded Context Schema & ERD**
> 6 Tables | Generated dynamically by ACCSYSTEM engine

---

## Tables List

- `login_attempts`
- `modules`
- `role_permissions`
- `roles`
- `sessions`
- `users`

---

## Entity Relationship Diagram

```mermaid
erDiagram
    login_attempts {
        bigint20unsigned id "PK,UK"
        varchar50 username 
        int11 attempts 
        timestamp last_attempt 
        timestamp locked_until 
    }
    modules {
        bigint20unsigned id "PK,UK"
        varchar50 module_key "UK"
        varchar100 module_name_ar 
        varchar100 module_name_en 
        varchar50 category 
        varchar50 icon 
        int11 sort_order 
        tinyint1 is_active 
        timestamp created_at 
        timestamp updated_at 
    }
    role_permissions {
        bigint20unsigned id "PK,UK"
        bigint20unsigned role_id "FK,UK"
        bigint20unsigned module_id "FK,UK"
        tinyint1 can_view 
        tinyint1 can_create 
        tinyint1 can_edit 
        tinyint1 can_delete 
        bigint20unsigned created_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    roles {
        bigint20unsigned id "PK,UK"
        varchar50 role_key "UK"
        varchar100 role_name_ar 
        varchar100 role_name_en 
        text description 
        tinyint1 is_system 
        tinyint1 is_active 
        bigint20unsigned created_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    sessions {
        bigint20unsigned id "PK,UK"
        bigint20unsigned user_id "FK"
        varchar64 session_token "UK"
        varchar45 ip_address 
        varchar255 user_agent 
        datetime expires_at 
        timestamp created_at 
    }
    users {
        bigint20unsigned id "PK,UK"
        varchar50 username "UK"
        varchar255 password 
        varchar100 full_name 
        varchar20 role 
        tinyint1 is_active 
        bigint20unsigned manager_id "FK"
        bigint20unsigned role_id "FK"
        bigint20unsigned created_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    roles ||--o{ role_permissions : "role_id"
    modules ||--o{ role_permissions : "module_id"
    users ||--o{ role_permissions : "created_by"
    users ||--o{ roles : "created_by"
    users ||--o{ sessions : "user_id"
    users ||--o{ users : "manager_id"
    roles ||--o{ users : "role_id"
    users ||--o{ users : "created_by"
```

---

## Data Dictionary

### Table: `login_attempts`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `username` | `varchar(50)` | No |  | IDX |  |
| `attempts` | `int(11)` | No | `1` |  |  |
| `last_attempt` | `timestamp` | No | `current_timestamp()` |  |  |
| `locked_until` | `timestamp` | Yes | `NULL` |  |  |

### Table: `modules`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `module_key` | `varchar(50)` | No |  | IDX, *UK* |  |
| `module_name_ar` | `varchar(100)` | No |  |  |  |
| `module_name_en` | `varchar(100)` | No |  |  |  |
| `category` | `varchar(50)` | Yes | `NULL` | IDX |  |
| `icon` | `varchar(50)` | Yes | `NULL` |  |  |
| `sort_order` | `int(11)` | No | `0` |  |  |
| `is_active` | `tinyint(1)` | No | `1` | IDX |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `role_permissions`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `role_id` | `bigint(20) unsigned` | No |  | IDX, *UK* | -> `roles.id` |
| `module_id` | `bigint(20) unsigned` | No |  | IDX, *UK* | -> `modules.id` |
| `can_view` | `tinyint(1)` | No | `0` |  |  |
| `can_create` | `tinyint(1)` | No | `0` |  |  |
| `can_edit` | `tinyint(1)` | No | `0` |  |  |
| `can_delete` | `tinyint(1)` | No | `0` |  |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `roles`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `role_key` | `varchar(50)` | No |  | IDX, *UK* |  |
| `role_name_ar` | `varchar(100)` | No |  |  |  |
| `role_name_en` | `varchar(100)` | No |  |  |  |
| `description` | `text` | Yes | `NULL` |  |  |
| `is_system` | `tinyint(1)` | No | `0` |  |  |
| `is_active` | `tinyint(1)` | No | `1` | IDX |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `sessions`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `user_id` | `bigint(20) unsigned` | No |  | IDX | -> `users.id` |
| `session_token` | `varchar(64)` | No |  | *UK* |  |
| `ip_address` | `varchar(45)` | Yes | `NULL` |  |  |
| `user_agent` | `varchar(255)` | Yes | `NULL` |  |  |
| `expires_at` | `datetime` | No |  |  |  |
| `created_at` | `timestamp` | No | `current_timestamp()` |  |  |

### Table: `users`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `username` | `varchar(50)` | No |  | *UK* |  |
| `password` | `varchar(255)` | No |  |  |  |
| `full_name` | `varchar(100)` | Yes | `NULL` |  |  |
| `role` | `varchar(20)` | No | `'admin'` |  |  |
| `is_active` | `tinyint(1)` | No | `1` |  |  |
| `manager_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `role_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `roles.id` |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

