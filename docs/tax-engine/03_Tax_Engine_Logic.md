# Tax Engine: Calculation Logic & Service Layer

The `TaxCalculator` service is the heart of the system. It abstracts the complexity of looking up rates and handling multiple authorities.

## 1. Using the TaxCalculator

The service should be injected into your Controller or Action class.

```php
use App\Services\Tax\TaxCalculator;

public function __construct(private TaxCalculator $taxCalculator) {}

public function processInvoice(Invoice $invoice)
{
    // 1. Calculate taxes
    $result = $this->taxCalculator->calculate(
        taxableAmount: 1000.00,
        countryCode: 'SA',
        asOf: $invoice->invoice_date,
        taxableType: get_class($invoice),
        taxableId: $invoice->id,
        applicableArea: 'sales'
    );

    // 2. The $result (TaxCalculationResult) contains totals and lines
    $invoice->vat_amount = $result->getTotalTaxAmount();
    $invoice->total_amount = $invoice->subtotal + $invoice->vat_amount;
    $invoice->save();
}
```

## 2. Calculation Modes

### A. Percentage Mode
The calculation formula is:
`Tax Amount = Taxable Amount * Rate`
*Rounding is performed to 4 decimal places during calculation and 2 decimal places for storage.*

### B. Fixed Amount Mode
Used for specific levies (e.g., Plastic Bag Tax).
`Tax Amount = Fixed Amount (per line or per transaction)`

## 3. The `TaxCalculationResult` Object
This Data Transfer Object (DTO) carries the results of the calculation:
- `totalTax`: Sum of all calculated taxes.
- `lines`: Array of specific breakthroughs (Rate, Type, Authority, GL Account).
- `summary()`: Method to get a grouped summary of taxes by authority.

## 4. Feature Flag & Fallback
The system supports a hybrid state via the `config('tax.use_tax_engine')` flag.

- **ENABLED (`true`)**: The engine queries the database `tax_rates` tables.
- **DISABLED (`false`)**: The engine falls back to `config('accounting.vat_rate')` (Legacy Mode).

This allows for zero-downtime migrations where the engine can be tested in staging before global rollout.

## 5. Persistence (Audit Trail)
When `taxableId` and `taxableType` are provided to the `calculate()` method, the engine automatically creates `TaxLine` records in the database. 
**Important**: These lines should be purged and recalculated if the transaction is edited before it is "Posted" or "Finalized".
