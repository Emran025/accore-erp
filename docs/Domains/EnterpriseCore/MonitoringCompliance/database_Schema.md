# EnterpriseCore - MonitoringCompliance

> **Bounded Context Schema & ERD**
> 6 Tables | Generated dynamically by ACCSYSTEM engine

---

## Tables List

- `capa`
- `compliance_profiles`
- `nr_expansion_logs`
- `qa_compliance`
- `telescope`
- `topology_rules_matrix`

---

## Entity Relationship Diagram

```mermaid
erDiagram
    capa {
        bigint20unsigned id "PK,UK"
        varchar50 capa_number "UK"
        bigint20unsigned compliance_id "FK"
        bigint20unsigned employee_id "FK"
        enumcorrectivepreven type 
        text issue_description 
        text root_cause 
        text action_plan 
        enumopenin_progressc status 
        date target_date 
        date completed_date 
        text verification 
        bigint20unsigned assigned_to "FK"
        bigint20unsigned completed_by "FK"
        text notes 
        timestamp created_at 
        timestamp updated_at 
        timestamp deleted_at 
    }
    compliance_profiles {
        bigint20unsigned id "PK,UK"
        bigint20unsigned tax_authority_id "FK"
        bigint20unsigned tax_type_id "FK"
        varchar150 name 
        varchar40 code "UK"
        enumpushpull policy_type 
        enumjsonxmlymlexcel transmission_format 
        longtext key_mapping 
        longtext structure_template 
        varchar255 endpoint_url 
        varchar30 auth_type 
        text auth_credentials 
        longtext request_headers 
        varchar10 http_method 
        longtext openapi_spec 
        varchar128 access_token "UK"
        timestamp token_expires_at 
        longtext allowed_ips 
        varchar100 pull_endpoint_path 
        tinyint1 is_active 
        text notes 
        timestamp created_at 
        timestamp updated_at 
    }
    nr_expansion_logs {
        bigint20unsigned id "PK,UK"
        bigint20unsigned nr_interval_id "FK"
        bigint20unsigned old_from 
        bigint20unsigned old_to 
        bigint20unsigned new_from 
        bigint20unsigned new_to 
        varchar255 reason 
        bigint20unsigned expanded_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    qa_compliance {
        bigint20unsigned id "PK,UK"
        varchar50 compliance_number "UK"
        enumisosocinternal_a compliance_type 
        varchar255 standard_name 
        text description 
        bigint20unsigned employee_id "FK"
        enumpendingin_progre status 
        date due_date 
        date completed_date 
        text findings 
        text corrective_action 
        bigint20unsigned assigned_to "FK"
        bigint20unsigned completed_by "FK"
        text notes 
        timestamp created_at 
        timestamp updated_at 
        timestamp deleted_at 
    }
    telescope {
        bigint20unsigned id "PK,UK"
        bigint20unsigned user_id "FK"
        varchar20 operation 
        varchar50 table_name 
        bigint20unsigned record_id 
        longtext old_values 
        longtext new_values 
        varchar45 ip_address 
        varchar255 user_agent 
        timestamp created_at 
    }
    topology_rules_matrix {
        bigint20unsigned id "PK,UK"
        varchar32 source_node_type_id "FK"
        varchar32 target_node_type_id "FK"
        varchar8 cardinality 
        varchar20 link_direction 
        longtext constraint_logic 
        tinyint1 is_active 
        text description 
        int10unsigned sort_order 
        timestamp created_at 
        timestamp updated_at 
    }
    qa_compliance ||--o{ capa : "compliance_id"
    employees ||--o{ capa : "employee_id"
    users ||--o{ capa : "assigned_to"
    users ||--o{ capa : "completed_by"
    tax_authorities ||--o{ compliance_profiles : "tax_authority_id"
    tax_types ||--o{ compliance_profiles : "tax_type_id"
    nr_intervals ||--o{ nr_expansion_logs : "nr_interval_id"
    users ||--o{ nr_expansion_logs : "expanded_by"
    employees ||--o{ qa_compliance : "employee_id"
    users ||--o{ qa_compliance : "assigned_to"
    users ||--o{ qa_compliance : "completed_by"
    users ||--o{ telescope : "user_id"
    org_meta_types ||--o{ topology_rules_matrix : "source_node_type_id"
    org_meta_types ||--o{ topology_rules_matrix : "target_node_type_id"
```

---

## Data Dictionary

### Table: `capa`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `capa_number` | `varchar(50)` | No |  | *UK* |  |
| `compliance_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `qa_compliance.id` |
| `employee_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `employees.id` |
| `type` | `enum('corrective','preventive')` | No | `'corrective'` |  |  |
| `issue_description` | `text` | No |  |  |  |
| `root_cause` | `text` | Yes | `NULL` |  |  |
| `action_plan` | `text` | Yes | `NULL` |  |  |
| `status` | `enum('open','in_progress','completed','closed','cancelled')` | No | `'open'` |  |  |
| `target_date` | `date` | Yes | `NULL` |  |  |
| `completed_date` | `date` | Yes | `NULL` |  |  |
| `verification` | `text` | Yes | `NULL` |  |  |
| `assigned_to` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `completed_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `notes` | `text` | Yes | `NULL` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |
| `deleted_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `compliance_profiles`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `tax_authority_id` | `bigint(20) unsigned` | No |  | IDX | -> `tax_authorities.id` |
| `tax_type_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `tax_types.id` |
| `name` | `varchar(150)` | No |  |  |  |
| `code` | `varchar(40)` | No |  | *UK* |  |
| `policy_type` | `enum('push','pull')` | No | `'push'` | IDX |  |
| `transmission_format` | `enum('json','xml','yml','excel')` | No | `'json'` |  |  |
| `key_mapping` | `longtext` | Yes | `NULL` |  |  |
| `structure_template` | `longtext` | Yes | `NULL` |  |  |
| `endpoint_url` | `varchar(255)` | Yes | `NULL` |  |  |
| `auth_type` | `varchar(30)` | Yes | `NULL` |  |  |
| `auth_credentials` | `text` | Yes | `NULL` |  |  |
| `request_headers` | `longtext` | Yes | `NULL` |  |  |
| `http_method` | `varchar(10)` | No | `'POST'` |  |  |
| `openapi_spec` | `longtext` | Yes | `NULL` |  |  |
| `access_token` | `varchar(128)` | Yes | `NULL` | *UK* |  |
| `token_expires_at` | `timestamp` | Yes | `NULL` |  |  |
| `allowed_ips` | `longtext` | Yes | `NULL` |  |  |
| `pull_endpoint_path` | `varchar(100)` | Yes | `NULL` |  |  |
| `is_active` | `tinyint(1)` | No | `1` | IDX |  |
| `notes` | `text` | Yes | `NULL` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `nr_expansion_logs`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `nr_interval_id` | `bigint(20) unsigned` | No |  | IDX | -> `nr_intervals.id` |
| `old_from` | `bigint(20) unsigned` | No |  |  |  |
| `old_to` | `bigint(20) unsigned` | No |  |  |  |
| `new_from` | `bigint(20) unsigned` | No |  |  |  |
| `new_to` | `bigint(20) unsigned` | No |  |  |  |
| `reason` | `varchar(255)` | Yes | `NULL` |  |  |
| `expanded_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `qa_compliance`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `compliance_number` | `varchar(50)` | No |  | *UK* |  |
| `compliance_type` | `enum('iso','soc','internal_audit','regulatory','other')` | No | `'internal_audit'` |  |  |
| `standard_name` | `varchar(255)` | No |  |  |  |
| `description` | `text` | Yes | `NULL` |  |  |
| `employee_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `employees.id` |
| `status` | `enum('pending','in_progress','completed','non_compliant','cancelled')` | No | `'pending'` |  |  |
| `due_date` | `date` | Yes | `NULL` |  |  |
| `completed_date` | `date` | Yes | `NULL` |  |  |
| `findings` | `text` | Yes | `NULL` |  |  |
| `corrective_action` | `text` | Yes | `NULL` |  |  |
| `assigned_to` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `completed_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `notes` | `text` | Yes | `NULL` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |
| `deleted_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `telescope`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `user_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `operation` | `varchar(20)` | No |  |  |  |
| `table_name` | `varchar(50)` | No |  |  |  |
| `record_id` | `bigint(20) unsigned` | Yes | `NULL` |  |  |
| `old_values` | `longtext` | Yes | `NULL` |  |  |
| `new_values` | `longtext` | Yes | `NULL` |  |  |
| `ip_address` | `varchar(45)` | Yes | `NULL` |  |  |
| `user_agent` | `varchar(255)` | Yes | `NULL` |  |  |
| `created_at` | `timestamp` | No | `current_timestamp()` |  |  |

### Table: `topology_rules_matrix`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `source_node_type_id` | `varchar(32)` | No |  | IDX | -> `org_meta_types.id` |
| `target_node_type_id` | `varchar(32)` | No |  | IDX | -> `org_meta_types.id` |
| `cardinality` | `varchar(8)` | No | `'N:1'` |  |  |
| `link_direction` | `varchar(20)` | No | `'source_to_target'` |  |  |
| `constraint_logic` | `longtext` | Yes | `NULL` |  |  |
| `is_active` | `tinyint(1)` | No | `1` |  |  |
| `description` | `text` | Yes | `NULL` |  |  |
| `sort_order` | `int(10) unsigned` | No | `0` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

