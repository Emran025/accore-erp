# Tax Engine: Domain Model & Schema

The Tax Engine relies on a normalized schema to manage jurisdictions, types, and historical rates.

## 1. Entity Relationship Overview

```mermaid
erDiagram
    TAX_AUTHORITY ||--o{ TAX_TYPE : "defines"
    TAX_TYPE ||--o{ TAX_RATE : "has history of"
    TAX_LINE }o--|| TAX_AUTHORITY : "refs"
    TAX_LINE }o--|| TAX_TYPE : "refs"
    TAX_LINE }o--|| TRANSACTION : "belongs to"

    TAX_AUTHORITY {
        string code "e.g., ZATCA"
        string name "e.g., General Authority of Zakat & Tax"
        string country_code "ISO (SA, AE)"
        boolean is_active
    }

    TAX_TYPE {
        string code "e.g., VAT, EXCISE"
        string name
        string calculation_type "percentage | fixed_amount"
        string gl_account_code "Linked COA"
        json applicable_areas "['sales', 'purchases']"
    }

    TAX_RATE {
        decimal rate "0.15"
        decimal fixed_amount
        date effective_from
        date effective_to
        boolean is_default
    }

    TAX_LINE {
        string taxable_type "App\Models\Invoice"
        bigint taxable_id
        decimal taxable_amount
        decimal tax_amount
        decimal rate
        json metadata "Authority specific data"
    }
```

## 2. Model Definitions

### `TaxAuthority`
Represents the jurisdiction. Each country typically has one primary authority (e.g., ZATCA for SA).
- **Scope**: Used to group tax types and identify compliance requirements.

### `TaxType`
Defines the nature of the tax. 
- **Calculation Type**: Can be `percentage` (standard VAT) or `fixed_amount` (e.g., environmental fees).
- **GL Integration**: Directly specifies which Chart of Accounts code receives the tax credit/debit.

### `TaxRate`
The historical record of values. Since tax laws change (e.g., SA VAT moving from 5% to 15%), rates are versioned by `effective_from` dates.
- The Engine always picks the rate where `effective_from <= transaction_date <= effective_to`.

### `TaxLine`
The transaction record. Unlike the other models which are "Config", `TaxLine` is "Data".
- It stores a snapshot of the rate and authority at the time of posting.
- It links back to the parent transaction (Polymorphic relationship).

## 3. Database Seeders
To initialize the engine for Saudi Arabia (ZATCA), use:
```bash
php artisan db:seed --class=TaxSeeder
```
This will populate the default 15% VAT for ZATCA and link it to the appropriate GL accounts specified in the system settings.
