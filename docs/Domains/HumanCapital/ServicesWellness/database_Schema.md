# HumanCapital - ServicesWellness

> **Bounded Context Schema & ERD**
> 6 Tables | Generated dynamically by ACCSYSTEM engine

---

## Tables List

- `employee_health_records`
- `leave_requests`
- `travel_expenses`
- `travel_requests`
- `wellness_participations`
- `wellness_programs`

---

## Entity Relationship Diagram

```mermaid
erDiagram
    employee_health_records {
        bigint20unsigned id "PK,UK"
        bigint20unsigned employee_id "FK"
        enumvaccinationmedic record_type 
        date record_date 
        date expiry_date 
        varchar255 provider_name 
        text results 
        varchar500 file_path 
        text notes 
        timestamp created_at 
        timestamp updated_at 
    }
    leave_requests {
        bigint20unsigned id "PK,UK"
        bigint20unsigned employee_id "FK"
        enumvacationsickemer leave_type 
        date start_date 
        date end_date 
        decimal52 days_requested 
        text reason 
        enumpendingapprovedr status 
        bigint20unsigned approved_by "FK"
        datetime approved_at 
        text rejection_reason 
        longtext approval_trail 
        bigint20unsigned created_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    travel_expenses {
        bigint20unsigned id "PK,UK"
        bigint20unsigned travel_request_id "FK"
        bigint20unsigned employee_id "FK"
        enumflighthotelmealt expense_type 
        date expense_date 
        decimal102 amount 
        varchar3 currency 
        decimal104 exchange_rate 
        decimal102 amount_in_base_currency 
        varchar500 receipt_path 
        text description 
        enumpendingsubmitted status 
        tinyint1 is_duplicate 
        bigint20unsigned approved_by "FK"
        text notes 
        timestamp created_at 
        timestamp updated_at 
    }
    travel_requests {
        bigint20unsigned id "PK,UK"
        varchar50 request_number "UK"
        bigint20unsigned employee_id "FK"
        enumdraftpending_app status 
        varchar255 destination 
        text purpose 
        date departure_date 
        date return_date 
        decimal102 estimated_cost 
        bigint20unsigned approved_by "FK"
        timestamp approved_at 
        text rejection_reason 
        text notes 
        timestamp created_at 
        timestamp updated_at 
    }
    wellness_participations {
        bigint20unsigned id "PK,UK"
        bigint20unsigned program_id "FK"
        bigint20unsigned employee_id "FK"
        longtext metrics_data 
        int11 points 
        enumenrolledactiveco status 
        date enrollment_date 
        text notes 
        timestamp created_at 
        timestamp updated_at 
    }
    wellness_programs {
        bigint20unsigned id "PK,UK"
        varchar255 program_name 
        text description 
        enumsteps_challengeh program_type 
        date start_date 
        date end_date 
        tinyint1 is_active 
        longtext target_metrics 
        bigint20unsigned created_by "FK"
        timestamp created_at 
        timestamp updated_at 
    }
    employees ||--o{ employee_health_records : "employee_id"
    employees ||--o{ leave_requests : "employee_id"
    users ||--o{ leave_requests : "approved_by"
    users ||--o{ leave_requests : "created_by"
    travel_requests ||--o{ travel_expenses : "travel_request_id"
    employees ||--o{ travel_expenses : "employee_id"
    users ||--o{ travel_expenses : "approved_by"
    employees ||--o{ travel_requests : "employee_id"
    users ||--o{ travel_requests : "approved_by"
    wellness_programs ||--o{ wellness_participations : "program_id"
    employees ||--o{ wellness_participations : "employee_id"
    users ||--o{ wellness_programs : "created_by"
```

---

## Data Dictionary

### Table: `employee_health_records`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `employee_id` | `bigint(20) unsigned` | No |  | IDX | -> `employees.id` |
| `record_type` | `enum('vaccination','medical_exam','drug_test','health_screening','other')` | No | `'medical_exam'` |  |  |
| `record_date` | `date` | No |  |  |  |
| `expiry_date` | `date` | Yes | `NULL` |  |  |
| `provider_name` | `varchar(255)` | Yes | `NULL` |  |  |
| `results` | `text` | Yes | `NULL` |  |  |
| `file_path` | `varchar(500)` | Yes | `NULL` |  |  |
| `notes` | `text` | Yes | `NULL` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `leave_requests`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `employee_id` | `bigint(20) unsigned` | No |  | IDX | -> `employees.id` |
| `leave_type` | `enum('vacation','sick','emergency','unpaid','other')` | No | `'vacation'` |  |  |
| `start_date` | `date` | No |  | IDX |  |
| `end_date` | `date` | No |  | IDX |  |
| `days_requested` | `decimal(5,2)` | No |  |  |  |
| `reason` | `text` | Yes | `NULL` |  |  |
| `status` | `enum('pending','approved','rejected','cancelled')` | No | `'pending'` | IDX, IDX |  |
| `approved_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `approved_at` | `datetime` | Yes | `NULL` |  |  |
| `rejection_reason` | `text` | Yes | `NULL` |  |  |
| `approval_trail` | `longtext` | Yes | `NULL` |  |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `travel_expenses`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `travel_request_id` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `travel_requests.id` |
| `employee_id` | `bigint(20) unsigned` | No |  | IDX | -> `employees.id` |
| `expense_type` | `enum('flight','hotel','meal','transportation','other')` | No | `'other'` |  |  |
| `expense_date` | `date` | No |  |  |  |
| `amount` | `decimal(10,2)` | No |  |  |  |
| `currency` | `varchar(3)` | No | `'SAR'` |  |  |
| `exchange_rate` | `decimal(10,4)` | No | `1.0000` |  |  |
| `amount_in_base_currency` | `decimal(10,2)` | No |  |  |  |
| `receipt_path` | `varchar(500)` | Yes | `NULL` |  |  |
| `description` | `text` | Yes | `NULL` |  |  |
| `status` | `enum('pending','submitted','approved','rejected','reimbursed')` | No | `'pending'` |  |  |
| `is_duplicate` | `tinyint(1)` | No | `0` |  |  |
| `approved_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `notes` | `text` | Yes | `NULL` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `travel_requests`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `request_number` | `varchar(50)` | No |  | *UK* |  |
| `employee_id` | `bigint(20) unsigned` | No |  | IDX | -> `employees.id` |
| `status` | `enum('draft','pending_approval','approved','rejected','cancelled','completed')` | No | `'draft'` |  |  |
| `destination` | `varchar(255)` | No |  |  |  |
| `purpose` | `text` | No |  |  |  |
| `departure_date` | `date` | No |  |  |  |
| `return_date` | `date` | No |  |  |  |
| `estimated_cost` | `decimal(10,2)` | No | `0.00` |  |  |
| `approved_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `approved_at` | `timestamp` | Yes | `NULL` |  |  |
| `rejection_reason` | `text` | Yes | `NULL` |  |  |
| `notes` | `text` | Yes | `NULL` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `wellness_participations`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `program_id` | `bigint(20) unsigned` | No |  | IDX | -> `wellness_programs.id` |
| `employee_id` | `bigint(20) unsigned` | No |  | IDX | -> `employees.id` |
| `metrics_data` | `longtext` | Yes | `NULL` |  |  |
| `points` | `int(11)` | No | `0` |  |  |
| `status` | `enum('enrolled','active','completed','dropped')` | No | `'enrolled'` |  |  |
| `enrollment_date` | `date` | No |  |  |  |
| `notes` | `text` | Yes | `NULL` |  |  |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

### Table: `wellness_programs`

| Column | Type | Nullable | Default | Indexes | Foreign Keys |
|---|---|---|---|---|---|
| `id` | `bigint(20) unsigned` | No |  | **PK** |  |
| `program_name` | `varchar(255)` | No |  |  |  |
| `description` | `text` | Yes | `NULL` |  |  |
| `program_type` | `enum('steps_challenge','health_challenge','fitness','nutrition','mental_health','other')` | No | `'steps_challenge'` |  |  |
| `start_date` | `date` | No |  |  |  |
| `end_date` | `date` | No |  |  |  |
| `is_active` | `tinyint(1)` | No | `1` |  |  |
| `target_metrics` | `longtext` | Yes | `NULL` |  |  |
| `created_by` | `bigint(20) unsigned` | Yes | `NULL` | IDX | -> `users.id` |
| `created_at` | `timestamp` | Yes | `NULL` |  |  |
| `updated_at` | `timestamp` | Yes | `NULL` |  |  |

