# Tax Engine: Frontend Implementation

The frontend is designed to be "tax-aware," meaning it can display multiple tax lines and breakdowns regardless of which authority is active.

## 1. The `TaxBreakdown` Component
Located in `frontend/components/tax/TaxBreakdown.tsx`.

This is the primary UI element for displaying taxes. It supports:
- **New Format**: Iterating over `tax_lines` collections from the API.
- **Legacy Fallback**: Displaying a single VAT line if only `vat_amount`/`vat_rate` are provided.
- **Compact Mode**: A single row showing the total tax amount (used in list views).
- **Detailed Mode**: A breakdown by Tax Type (e.g., VAT 15%, Municipal Tax 2%) with authority names.

### Usage Example:
```tsx
import { TaxBreakdown } from "@/components/tax/TaxBreakdown";

// In an Invoice Detail page
<TaxBreakdown 
  taxLines={invoice.tax_lines} 
  vatAmount={invoice.vat_amount} // Fallback
/>
```

## 2. API Integration
The `InvoiceResource` (and other taxable resources) in the backend include a `tax_lines` property when the Tax Engine is enabled.

```json
{
  "id": 123,
  "subtotal": 1000.0,
  "vat_amount": 150.0,
  "tax_lines": [
    {
      "tax_type_code": "VAT",
      "tax_authority_code": "ZATCA",
      "rate": 0.15,
      "taxable_amount": 1000.0,
      "tax_amount": 150.0
    }
  ]
}
```

## 3. Localization (i18n)
The component includes Arabic labels by default to support the primary market (KSA). It accepts a `labels` prop to override these values.

- **Default Labels**:
  - `taxBreakdown`: "تفاصيل الضريبة"
  - `vat`: "ضريبة القيمة المضافة"

## 4. UI Patterns
- **Invoice Dialogs**: Shows full breakdown at the bottom of the totals section.
- **Ledgers**: Shows tax attribution for high-value transactions.
- **Create/Edit Forms**: The tax selection dropdowns are populated from the `/api/v1/tax-rates` endpoint, filtered by the company's default country.
