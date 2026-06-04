# EnterpriseCore - OrganizationGovernance

> **Bounded Context Schema & ERD**
> 5 Tables | Generated dynamically by accore engine

---

## Tables List

- `org_change_history`
- `org_meta_type_attributes`
- `org_meta_types`
- `structure_links`
- `structure_nodes`

---

## Entity Relationship Diagram

```mermaid
erDiagram
    org_change_history {
        bigint20unsigned id "PK,UK"
        varchar32 entity_type 
        varchar64 entity_id 
        varchar20 change_type 
        longtext old_values 
        longtext new_values 
        varchar255 change_reason 
        bigint20unsigned changed_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    org_meta_type_attributes {
        bigint20unsigned id "PK,UK"
        varchar32 org_meta_type_id "FK"
        varchar64 attribute_key 
        varchar20 attribute_type 
        tinyint1 is_mandatory 
        text default_value 
        longtext validation_rule 
        varchar32 reference_type_id 
        int10unsigned sort_order 
        timestamp created_at 
        timestamp updated_at 
    }
    org_meta_types {
        varchar32 id "PK,UK"
        varchar100 display_name 
        varchar100 display_name_ar 
        varchar32 level_domain 
        text description 
        tinyint1 is_assignable 
        int10unsigned sort_order 
        timestamp created_at 
        timestamp updated_at 
    }
    structure_links {
        bigint20unsigned id "PK,UK"
        char36 source_node_uuid "FK,UK"
        char36 target_node_uuid "FK,UK"
        bigint20unsigned topology_rule_id "FK"
        varchar32 link_type "UK"
        int10unsigned priority 
        date valid_from 
        date valid_to 
        bigint20unsigned created_by 
        timestamp created_at 
        timestamp updated_at 
    }
    structure_nodes {
        char36 node_uuid "PK,UK"
        varchar32 node_type_id "FK,UK"
        varchar32 code "UK"
        longtext attributes_json 
        varchar20 status 
        date valid_from 
        date valid_to 
        bigint20unsigned created_by "FK"
        bigint20unsigned updated_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    users ||--o{ org_change_history : "changed_by"
    org_meta_types ||--o{ org_meta_type_attributes : "org_meta_type_id"
    structure_nodes ||--o{ structure_links : "source_node_uuid"
    structure_nodes ||--o{ structure_links : "target_node_uuid"
    topology_rules_matrix ||--o{ structure_links : "topology_rule_id"
    org_meta_types ||--o{ structure_nodes : "node_type_id"
    users ||--o{ structure_nodes : "created_by"
    users ||--o{ structure_nodes : "updated_by"
```

---

## Data Dictionary

### Table: `org_change_history`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `entity_type` | `varchar(32)` | No |  | IDX |  |
| `entity_id` | `varchar(64)` | No |  | IDX |  |
| `change_type` | `varchar(20)` | No |  | IDX |  |
| `old_values` | `longtext` | Yes | `NULL` |  |  |
| `new_values` | `longtext` | Yes | `NULL` |  |  |
| `change_reason` | `varchar(255)` | Yes | `NULL` |  |  |
| `changed_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `org_meta_type_attributes`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `org_meta_type_id` | `varchar(32)` | No |  | IDX | -> `org_meta_types.id` |
| `attribute_key` | `varchar(64)` | No |  |  |  |
| `attribute_type` | `varchar(20)` | No | `'string'` |  |  |
| `is_mandatory` | `tinyint(1)` | No | `0` |  |  |
| `default_value` | `text` | Yes | `NULL` |  |  |
| `validation_rule` | `longtext` | Yes | `NULL` |  |  |
| `reference_type_id` | `varchar(32)` | Yes | `NULL` |  |  |
| `sort_order` | `int(10) unsigned` | No | `0` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `org_meta_types`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `varchar(32)` | No |  | **PK** |  |
| `display_name` | `varchar(100)` | No |  |  |  |
| `display_name_ar` | `varchar(100)` | Yes | `NULL` |  |  |
| `level_domain` | `varchar(32)` | No | `'Financial'` |  |  |
| `description` | `text` | Yes | `NULL` |  |  |
| `is_assignable` | `tinyint(1)` | No | `1` |  |  |
| `sort_order` | `int(10) unsigned` | No | `0` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `structure_links`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `source_node_uuid` | `char(36)` | No |  | *UK* | -> `structure_nodes.node_uuid` |
| `target_node_uuid` | `char(36)` | No |  | *UK*, IDX | -> `structure_nodes.node_uuid` |
| `topology_rule_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `topology_rules_matrix.id` |
| `link_type` | `varchar(32)` | No | `'assignment'` | *UK* |  |
| `priority` | `int(10) unsigned` | No | `0` |  |  |
| `valid_from` | `date` | Yes | `NULL` |  |  |
| `valid_to` | `date` | Yes | `NULL` |  |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `structure_nodes`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `node_uuid` | `char(36)` | No |  | **PK** |  |
| `node_type_id` | `varchar(32)` | No |  | *UK* | -> `org_meta_types.id` |
| `code` | `varchar(32)` | No |  | *UK* |  |
| `attributes_json` | `longtext` | Yes | `NULL` |  |  |
| `status` | `varchar(20)` | No | `'active'` |  |  |
| `valid_from` | `date` | Yes | `NULL` |  |  |
| `valid_to` | `date` | Yes | `NULL` |  |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `updated_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

