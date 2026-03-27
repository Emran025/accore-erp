# HumanCapital - WorkforceAdmin

> **Bounded Context Schema & ERD**
> 11 Tables | Generated dynamically by ACCSYSTEM engine

---

## Tables List

- `contingent_workers`
- `departments`
- `employee_certifications`
- `employee_documents`
- `employee_relations_cases`
- `employees`
- `expat_documents`
- `expat_management`
- `onboarding_documents`
- `onboarding_tasks`
- `onboarding_workflows`

---

## Entity Relationship Diagram

```mermaid
erDiagram
    contingent_workers {
        bigint20unsigned id "PK,UK"
        varchar50 worker_code "UK"
        varchar100 full_name 
        varchar100 email 
        varchar20 phone 
        enumcontractorconsul worker_type 
        varchar255 company_name 
        varchar50 tax_id 
        date start_date 
        date end_date 
        enumactiveinactivete status 
        text service_description 
        varchar50 sow_number 
        decimal102 hourly_rate 
        decimal102 monthly_rate 
        text contract_terms 
        date badge_expiry 
        date system_access_expiry 
        tinyint1 has_insurance 
        text insurance_details 
        text notes 
        bigint20unsigned created_by "FK"
        timestamp created_at 
        timestamp updated_at 
        timestamp deleted_at 
    }
    departments {
        bigint20unsigned id "PK,UK"
        varchar100 name_ar 
        varchar100 name_en 
        text description 
        bigint20unsigned manager_id "FK"
        bigint20unsigned cost_center_id "FK"
        bigint20unsigned profit_center_id "FK"
        tinyint1 is_active 
        timestamp created_at 
        timestamp updated_at 
    }
    employee_certifications {
        bigint20unsigned id "PK,UK"
        bigint20unsigned employee_id "FK"
        varchar255 certification_name 
        varchar255 issuing_organization 
        varchar100 certification_number 
        date issue_date 
        date expiry_date 
        tinyint1 is_recurring 
        int11 recurrence_months 
        varchar500 file_path 
        text notes 
        timestamp created_at 
        timestamp updated_at 
    }
    employee_documents {
        bigint20unsigned id "PK,UK"
        bigint20unsigned employee_id "FK"
        enumcvcontractcertif document_type 
        varchar255 document_name 
        varchar255 document_number 
        date issue_date 
        date expiration_date 
        varchar255 status 
        varchar500 file_path 
        varchar100 mime_type 
        int11 file_size 
        text notes 
        bigint20unsigned uploaded_by "FK"
        tinyint1 is_verified 
        bigint20unsigned verified_by "FK"
        timestamp verified_at 
        timestamp created_at 
        timestamp updated_at 
    }
    employee_relations_cases {
        bigint20unsigned id "PK,UK"
        varchar50 case_number "UK"
        bigint20unsigned employee_id "FK"
        enumgrievancediscipl case_type 
        enumpublicconfidenti confidentiality_level 
        text description 
        enumopenunder_invest status 
        date reported_date 
        date resolved_date 
        text resolution 
        bigint20unsigned reported_by "FK"
        bigint20unsigned assigned_to "FK"
        text notes 
        timestamp created_at 
        timestamp updated_at 
        timestamp deleted_at 
    }
    employees {
        bigint20unsigned id "PK,UK"
        varchar50 employee_code "UK"
        varchar100 full_name 
        varchar100 email "UK"
        varchar255 password 
        varchar20 phone 
        varchar20 national_id 
        date date_of_birth 
        enummalefemale gender 
        text address 
        bigint20unsigned department_id "FK"
        bigint20unsigned position_id "FK"
        date hire_date 
        date termination_date 
        enumactivesuspendedt employment_status 
        decimal152 base_salary 
        varchar50 gosi_number 
        varchar34 iban 
        varchar100 bank_name 
        decimal82 vacation_days_balance 
        enumfull_timepart_ti contract_type 
        bigint20unsigned account_id "FK"
        tinyint1 is_active 
        bigint20unsigned created_by "FK"
        bigint20unsigned role_id "FK"
        bigint20unsigned job_title_id "FK"
        bigint20unsigned user_id "FK"
        bigint20unsigned manager_id "FK"
        timestamp created_at 
        timestamp updated_at 
        timestamp deleted_at 
    }
    expat_documents {
        bigint20unsigned id "PK,UK"
        bigint20unsigned expat_id "FK"
        enumpassportvisawork document_type 
        varchar255 document_name 
        varchar500 file_path 
        date expiry_date 
        text notes 
        bigint20unsigned created_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    expat_management {
        bigint20unsigned id "PK,UK"
        bigint20unsigned employee_id "FK"
        varchar50 passport_number 
        date passport_expiry 
        varchar50 visa_number 
        date visa_expiry 
        varchar50 work_permit_number 
        date work_permit_expiry 
        varchar50 residency_number 
        date residency_expiry 
        varchar100 host_country 
        varchar100 home_country 
        decimal102 cost_of_living_adjustment 
        decimal102 housing_allowance 
        decimal102 relocation_package 
        tinyint1 tax_equalization 
        date repatriation_date 
        text notes 
        bigint20unsigned created_by "FK"
        timestamp created_at 
        timestamp updated_at 
        timestamp deleted_at 
    }
    onboarding_documents {
        bigint20unsigned id "PK,UK"
        bigint20unsigned workflow_id "FK"
        varchar255 document_name 
        enumi9w4direct_depos document_type 
        varchar500 file_path 
        enumpendingsentsigne status 
        varchar500 electronic_signature 
        timestamp signed_at 
        text notes 
        timestamp created_at 
        timestamp updated_at 
    }
    onboarding_tasks {
        bigint20unsigned id "PK,UK"
        bigint20unsigned workflow_id "FK"
        varchar255 task_name 
        text description 
        enumit_provisioningb task_type 
        enumitfacilitiessecu department 
        enumpendingin_progre status 
        int11 sequence_order 
        date due_date 
        date completed_date 
        bigint20unsigned assigned_to "FK"
        bigint20unsigned completed_by "FK"
        text notes 
        timestamp created_at 
        timestamp updated_at 
    }
    onboarding_workflows {
        bigint20unsigned id "PK,UK"
        bigint20unsigned employee_id "FK"
        enumonboardingoffboa workflow_type 
        enumnot_startedin_pr status 
        date start_date 
        date target_completion_date 
        date actual_completion_date 
        int11 completion_percentage 
        text notes 
        bigint20unsigned assigned_to "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    users ||--o{ contingent_workers : "created_by"
    employees ||--o{ departments : "manager_id"
    cost_centers ||--o{ departments : "cost_center_id"
    profit_centers ||--o{ departments : "profit_center_id"
    employees ||--o{ employee_certifications : "employee_id"
    employees ||--o{ employee_documents : "employee_id"
    users ||--o{ employee_documents : "uploaded_by"
    users ||--o{ employee_documents : "verified_by"
    employees ||--o{ employee_relations_cases : "employee_id"
    users ||--o{ employee_relations_cases : "reported_by"
    users ||--o{ employee_relations_cases : "assigned_to"
    departments ||--o{ employees : "department_id"
    positions ||--o{ employees : "position_id"
    chart_of_accounts ||--o{ employees : "account_id"
    users ||--o{ employees : "created_by"
    roles ||--o{ employees : "role_id"
    job_titles ||--o{ employees : "job_title_id"
    users ||--o{ employees : "user_id"
    employees ||--o{ employees : "manager_id"
    expat_management ||--o{ expat_documents : "expat_id"
    users ||--o{ expat_documents : "created_by"
    employees ||--o{ expat_management : "employee_id"
    users ||--o{ expat_management : "created_by"
    onboarding_workflows ||--o{ onboarding_documents : "workflow_id"
    onboarding_workflows ||--o{ onboarding_tasks : "workflow_id"
    users ||--o{ onboarding_tasks : "assigned_to"
    users ||--o{ onboarding_tasks : "completed_by"
    employees ||--o{ onboarding_workflows : "employee_id"
    users ||--o{ onboarding_workflows : "assigned_to"
```

---

## Data Dictionary

### Table: `contingent_workers`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `worker_code` | `varchar(50)` | No |  | *UK* |  |
| `full_name` | `varchar(100)` | No |  |  |  |
| `email` | `varchar(100)` | Yes | `NULL` |  |  |
| `phone` | `varchar(20)` | Yes | `NULL` |  |  |
| `worker_type` | `enum('contractor','consultant','freelancer','temp_agency')` | No | `'contractor'` |  |  |
| `company_name` | `varchar(255)` | Yes | `NULL` |  |  |
| `tax_id` | `varchar(50)` | Yes | `NULL` |  |  |
| `start_date` | `date` | No |  |  |  |
| `end_date` | `date` | Yes | `NULL` |  |  |
| `status` | `enum('active','inactive','terminated')` | No | `'active'` |  |  |
| `service_description` | `text` | Yes | `NULL` |  |  |
| `sow_number` | `varchar(50)` | Yes | `NULL` |  |  |
| `hourly_rate` | `decimal(10,2)` | Yes | `NULL` |  |  |
| `monthly_rate` | `decimal(10,2)` | Yes | `NULL` |  |  |
| `contract_terms` | `text` | Yes | `NULL` |  |  |
| `badge_expiry` | `date` | Yes | `NULL` |  |  |
| `system_access_expiry` | `date` | Yes | `NULL` |  |  |
| `has_insurance` | `tinyint(1)` | No | `0` |  |  |
| `insurance_details` | `text` | Yes | `NULL` |  |  |
| `notes` | `text` | Yes | `NULL` |  |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |
| `deleted_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `departments`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `name_ar` | `varchar(100)` | No |  |  |  |
| `name_en` | `varchar(100)` | Yes | `NULL` |  |  |
| `description` | `text` | Yes | `NULL` |  |  |
| `manager_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `employees.id` |
| `cost_center_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `cost_centers.id` |
| `profit_center_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `profit_centers.id` |
| `is_active` | `tinyint(1)` | No | `1` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `employee_certifications`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `employee_id` | `bigint(20) unsigned` | No |  | IDX | -> `employees.id` |
| `certification_name` | `varchar(255)` | No |  |  |  |
| `issuing_organization` | `varchar(255)` | Yes | `NULL` |  |  |
| `certification_number` | `varchar(100)` | Yes | `NULL` |  |  |
| `issue_date` | `date` | Yes | `NULL` |  |  |
| `expiry_date` | `date` | Yes | `NULL` |  |  |
| `is_recurring` | `tinyint(1)` | No | `0` |  |  |
| `recurrence_months` | `int(11)` | Yes | `NULL` |  |  |
| `file_path` | `varchar(500)` | Yes | `NULL` |  |  |
| `notes` | `text` | Yes | `NULL` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `employee_documents`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `employee_id` | `bigint(20) unsigned` | No |  | IDX | -> `employees.id` |
| `document_type` | `enum('cv','contract','certificate','other')` | No |  |  |  |
| `document_name` | `varchar(255)` | No |  |  |  |
| `document_number` | `varchar(255)` | Yes | `NULL` |  |  |
| `issue_date` | `date` | Yes | `NULL` |  |  |
| `expiration_date` | `date` | Yes | `NULL` |  |  |
| `status` | `varchar(255)` | No | `'active'` |  |  |
| `file_path` | `varchar(500)` | No |  |  |  |
| `mime_type` | `varchar(100)` | Yes | `NULL` |  |  |
| `file_size` | `int(11)` | Yes | `NULL` |  |  |
| `notes` | `text` | Yes | `NULL` |  |  |
| `uploaded_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `is_verified` | `tinyint(1)` | No | `0` |  |  |
| `verified_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `verified_at` | `timestamp` | Yes | `NULL` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `employee_relations_cases`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `case_number` | `varchar(50)` | No |  | *UK* |  |
| `employee_id` | `bigint(20) unsigned` | No |  | IDX | -> `employees.id` |
| `case_type` | `enum('grievance','disciplinary','investigation','whistleblowing','complaint','other')` | No | `'grievance'` |  |  |
| `confidentiality_level` | `enum('public','confidential','highly_confidential')` | No | `'confidential'` |  |  |
| `description` | `text` | No |  |  |  |
| `status` | `enum('open','under_investigation','hearing','resolved','closed','escalated')` | No | `'open'` |  |  |
| `reported_date` | `date` | No |  |  |  |
| `resolved_date` | `date` | Yes | `NULL` |  |  |
| `resolution` | `text` | Yes | `NULL` |  |  |
| `reported_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `assigned_to` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `notes` | `text` | Yes | `NULL` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |
| `deleted_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `employees`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `employee_code` | `varchar(50)` | No |  | *UK* |  |
| `full_name` | `varchar(100)` | No |  |  |  |
| `email` | `varchar(100)` | No |  | *UK* |  |
| `password` | `varchar(255)` | No |  |  |  |
| `phone` | `varchar(20)` | Yes | `NULL` |  |  |
| `national_id` | `varchar(20)` | Yes | `NULL` |  |  |
| `date_of_birth` | `date` | Yes | `NULL` |  |  |
| `gender` | `enum('male','female')` | Yes | `NULL` |  |  |
| `address` | `text` | Yes | `NULL` |  |  |
| `department_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `departments.id` |
| `position_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `positions.id` |
| `hire_date` | `date` | No |  |  |  |
| `termination_date` | `date` | Yes | `NULL` |  |  |
| `employment_status` | `enum('active','suspended','terminated')` | No | `'active'` |  |  |
| `base_salary` | `decimal(15,2)` | No | `0.00` |  |  |
| `gosi_number` | `varchar(50)` | Yes | `NULL` |  |  |
| `iban` | `varchar(34)` | Yes | `NULL` |  |  |
| `bank_name` | `varchar(100)` | Yes | `NULL` |  |  |
| `vacation_days_balance` | `decimal(8,2)` | No | `0.00` |  |  |
| `contract_type` | `enum('full_time','part_time','contract','freelance')` | No | `'full_time'` |  |  |
| `account_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `chart_of_accounts.id` |
| `is_active` | `tinyint(1)` | No | `1` |  |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `role_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `roles.id` |
| `job_title_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `job_titles.id` |
| `user_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `manager_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `employees.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |
| `deleted_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `expat_documents`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `expat_id` | `bigint(20) unsigned` | No |  | IDX | -> `expat_management.id` |
| `document_type` | `enum('passport','visa','work_permit','residency','contract','other')` | No | `'other'` |  |  |
| `document_name` | `varchar(255)` | No |  |  |  |
| `file_path` | `varchar(500)` | No |  |  |  |
| `expiry_date` | `date` | Yes | `NULL` |  |  |
| `notes` | `text` | Yes | `NULL` |  |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `expat_management`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `employee_id` | `bigint(20) unsigned` | No |  | IDX | -> `employees.id` |
| `passport_number` | `varchar(50)` | Yes | `NULL` |  |  |
| `passport_expiry` | `date` | Yes | `NULL` |  |  |
| `visa_number` | `varchar(50)` | Yes | `NULL` |  |  |
| `visa_expiry` | `date` | Yes | `NULL` |  |  |
| `work_permit_number` | `varchar(50)` | Yes | `NULL` |  |  |
| `work_permit_expiry` | `date` | Yes | `NULL` |  |  |
| `residency_number` | `varchar(50)` | Yes | `NULL` |  |  |
| `residency_expiry` | `date` | Yes | `NULL` |  |  |
| `host_country` | `varchar(100)` | Yes | `NULL` |  |  |
| `home_country` | `varchar(100)` | Yes | `NULL` |  |  |
| `cost_of_living_adjustment` | `decimal(10,2)` | No | `0.00` |  |  |
| `housing_allowance` | `decimal(10,2)` | No | `0.00` |  |  |
| `relocation_package` | `decimal(10,2)` | No | `0.00` |  |  |
| `tax_equalization` | `tinyint(1)` | No | `0` |  |  |
| `repatriation_date` | `date` | Yes | `NULL` |  |  |
| `notes` | `text` | Yes | `NULL` |  |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |
| `deleted_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `onboarding_documents`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `workflow_id` | `bigint(20) unsigned` | No |  | IDX | -> `onboarding_workflows.id` |
| `document_name` | `varchar(255)` | No |  |  |  |
| `document_type` | `enum('i9','w4','direct_deposit','nda','contract','policy','other')` | No | `'other'` |  |  |
| `file_path` | `varchar(500)` | Yes | `NULL` |  |  |
| `status` | `enum('pending','sent','signed','completed')` | No | `'pending'` |  |  |
| `electronic_signature` | `varchar(500)` | Yes | `NULL` |  |  |
| `signed_at` | `timestamp` | Yes | `NULL` |  |  |
| `notes` | `text` | Yes | `NULL` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `onboarding_tasks`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `workflow_id` | `bigint(20) unsigned` | No |  | IDX | -> `onboarding_workflows.id` |
| `task_name` | `varchar(255)` | No |  |  |  |
| `description` | `text` | Yes | `NULL` |  |  |
| `task_type` | `enum('it_provisioning','badge_access','system_id','document','training','facilities','security','payroll','other')` | No | `'other'` |  |  |
| `department` | `enum('it','facilities','security','hr','payroll','other')` | No | `'hr'` |  |  |
| `status` | `enum('pending','in_progress','completed','blocked')` | No | `'pending'` |  |  |
| `sequence_order` | `int(11)` | No | `0` |  |  |
| `due_date` | `date` | Yes | `NULL` |  |  |
| `completed_date` | `date` | Yes | `NULL` |  |  |
| `assigned_to` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `completed_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `notes` | `text` | Yes | `NULL` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `onboarding_workflows`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `employee_id` | `bigint(20) unsigned` | No |  | IDX | -> `employees.id` |
| `workflow_type` | `enum('onboarding','offboarding')` | No | `'onboarding'` |  |  |
| `status` | `enum('not_started','in_progress','completed','cancelled')` | No | `'not_started'` |  |  |
| `start_date` | `date` | No |  |  |  |
| `target_completion_date` | `date` | Yes | `NULL` |  |  |
| `actual_completion_date` | `date` | Yes | `NULL` |  |  |
| `completion_percentage` | `int(11)` | No | `0` |  |  |
| `notes` | `text` | Yes | `NULL` |  |  |
| `assigned_to` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

