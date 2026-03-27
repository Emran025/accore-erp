# Tax Engine: Migration & Implementation Strategy

Transforming from a static VAT system to a dynamic Tax Engine required a multi-phase approach to ensure data integrity and zero downtime.

## 1. Migration of Legacy Data
Existing invoices stored tax data in `vat_rate` and `vat_amount` fields. To transition:
1. **Backfill Script**: A migration (or `TaxSeeder`) was run to create `TaxLine` records for all historical invoices.
2. **Attribution**: Historical records were attributed to the default `ZATCA` authority with a `VAT` type.
3. **Verification**: Totals in the new `tax_lines` table were cross-referenced against the original `invoices.vat_amount` to ensure consistency.

## 2. Feature Toggle (`TAX_ENGINE_ENABLED`)
The engine can be toggled via the `.env` file:
```env
TAX_ENGINE_ENABLED=true
```
This env variable populates `config('tax.use_tax_engine')`. When `false`, the system uses hardcoded logic for 15% VAT, allowing for immediate rollback if issues are detected in the new engine.

## 3. Implementation Status (as of v3.0)

| Feature | Status | Note |
|---------|--------|------|
| Database Schema | ✅ Complete | Tables created and indexed. |
| Core Service | ✅ Complete | `TaxCalculator` handles all arithmetic. |
| ZATCA Adapter | ✅ Complete | UBL/QR generation active. |
| Data Migration | ✅ Complete | Historical invoices backfilled. |
| UI Components | ✅ Complete | React `TaxBreakdown` deployed. |

## 4. Maintenance & Adding Rates
When tax rates change (e.g., a new 20% VAT bracket), developers should:
1. Insert a new row into `tax_rates` with the appropriate `effective_from` date.
2. **DO NOT** modify existing rates, as this would break historical audit trails.
3. The engine will automatically start using the new rate for transactions dated on or after the `effective_from` date.

## 5. Deprecation Notice
The following fields are considered **DEPRECATED** and should not be used for new business logic:
- `invoices.vat_rate`
- `invoices.vat_amount` (use sum of `tax_lines` instead)
- `purchases.vat_rate`

These fields remain in the schema for backward compatibility with legacy reporting tools but will be removed in a future major release (v4.0).
