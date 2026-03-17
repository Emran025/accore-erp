<?php

namespace App\Domains\Commercial\SalesLifecycle\Services;

use App\Domains\Commercial\CRM\Models\ArCustomer;
use App\Domains\Commercial\RevenueReceivables\Models\ArTransaction;
use App\Domains\Commercial\SalesLifecycle\Models\Invoice;
use App\Domains\Commercial\SalesLifecycle\Models\InvoiceItem;
use App\Domains\Finance\GeneralLedger\Services\ChartOfAccountsMappingService;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use App\Domains\Finance\TaxCompliance\Services\TaxCalculator;
use App\Domains\Finance\TaxCompliance\Models\TaxLine;
use App\Domains\SupplyChain\Inventory\Models\Product;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Setting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Handles sales of intangible services.
 *
 * Key differences from product sales (SalesService):
 *  - NO inventory deduction (services have no stock)
 *  - NO COGS entry (no cost of goods for services)
 *  - NO stock sufficiency check
 *  - Services may be tax-exempt or use special tax types
 *  - Supports both CASH and CREDIT payment flows
 *
 * GL entries:
 *  CASH service:   Cash A/C (DR)  | Service Revenue A/C (CR) | Output VAT (CR, if taxable)
 *  CREDIT service: AR A/C (DR)    | Service Revenue A/C (CR) | Output VAT (CR, if taxable)
 */
class ServiceSaleService
{
    public function __construct(
        private readonly LedgerService $ledgerService,
        private readonly ChartOfAccountsMappingService $coaService,
    ) {}

    /**
     * Create a service sale invoice.
     *
     * @param array $data {
     *   invoice_number?, payment_type (cash|credit), customer_id?,
     *   user_id, amount_paid?, discount_amount?,
     *   items: [{ service_id, quantity, unit_price, description? }]
     * }
     * @return int  The ID of the newly created invoice
     * @throws \Exception
     */
    public function createServiceSale(array $data): int
    {
        return DB::transaction(function () use ($data) {
            $paymentType    = $data['payment_type'] ?? 'cash';
            $customerId     = $data['customer_id'] ?? null;
            $userId         = $data['user_id'] ?? auth()->id();
            $amountPaid     = (float)($data['amount_paid'] ?? 0);
            $discountAmount = (float)($data['discount_amount'] ?? 0);
            $items          = $data['items'] ?? [];

            if (empty($items)) {
                throw new \Exception("Service sale must have at least one service item.");
            }

            if ($paymentType === 'credit' && !$customerId) {
                throw new \Exception("Customer is required for credit service sales.");
            }

            // Resolve cash customer for walk-in cash sales
            if (!$customerId) {
                $cashCustomer = ArCustomer::withoutGlobalScopes()
                    ->where('customer_code', ArCustomer::CASH_CUSTOMER_CODE)
                    ->first();
                $customerId = $cashCustomer?->id;
            }

            // ── 1. Validate and price all service items ──────────────────────
            $subtotal     = 0;
            $lineItems    = [];
            $anyTaxable   = false;

            foreach ($items as $item) {
                $service = Product::services()->findOrFail($item['service_id']);

                if (!$service->sellable) {
                    throw new \Exception("Service '{$service->name}' is not available for sale.");
                }

                $quantity  = (float)($item['quantity'] ?? 1);
                $unitPrice = (float)($item['unit_price'] ?? $service->unit_price);
                $lineTotal = $quantity * $unitPrice;
                $subtotal += $lineTotal;

                if ($service->taxable) {
                    $anyTaxable = true;
                }

                $lineItems[] = [
                    'service_id'  => $service->id,
                    'description' => $item['description'] ?? $service->name,
                    'quantity'    => $quantity,
                    'unit_price'  => $unitPrice,
                    'line_total'  => $lineTotal,
                    'taxable'     => $service->taxable,
                ];
            }

            // ── 2. Calculate tax (Server Sovereignty — client rate ignored) ──
            $taxableAmount = $subtotal - $discountAmount;
            $vatAmount     = 0;
            $vatRate       = 0;

            if ($anyTaxable && $taxableAmount > 0) {
                $taxCalculator = app(TaxCalculator::class);
                if (TaxCalculator::isTaxEngineEnabled()) {
                    $countryCode = Setting::where('setting_key', 'company_country')->value('setting_value')
                        ?? config('tax.default_country', 'SA');
                    $taxResult = $taxCalculator->calculate(
                        $taxableAmount,
                        $countryCode,
                        null,
                        Invoice::class,
                        null,
                        'sales'
                    );
                    $vatRate   = $taxResult->getPrimaryVatRate();
                    $vatAmount = $taxResult->getTotalTax();
                } else {
                    $legacyResult = $taxCalculator->calculateLegacy($taxableAmount);
                    $vatRate      = (float) config('accounting.vat_rate', 0.0);
                    $vatAmount    = $legacyResult->getTotalTax();
                }
            }

            $totalAmount = $taxableAmount + $vatAmount;

            // ── 3. Generate voucher number ────────────────────────────────────
            $invoiceNumber = $data['invoice_number'] ?? ('SVC-' . time());
            $voucherNumber = $this->ledgerService->getNextVoucherNumber('SVC');

            // ── 4. Create Invoice record ──────────────────────────────────────
            $invoice = Invoice::create([
                'invoice_number' => $invoiceNumber,
                'voucher_number' => $voucherNumber,
                'payment_type'   => $paymentType,
                'customer_id'    => $customerId,
                'user_id'        => $userId,
                'subtotal'       => $subtotal,
                'discount_amount'=> $discountAmount,
                'vat_rate'       => $vatRate,
                'vat_amount'     => $vatAmount,
                'total_amount'   => $totalAmount,
                'amount_paid'    => $amountPaid,
                'invoice_type'   => 'service',
            ]);

            // ── 5. Create InvoiceItems ────────────────────────────────────────
            foreach ($lineItems as $line) {
                InvoiceItem::create([
                    'invoice_id'  => $invoice->id,
                    'product_id'  => $line['service_id'],
                    'quantity'    => $line['quantity'],
                    'unit_price'  => $line['unit_price'],
                    'line_total'  => $line['line_total'],
                    'description' => $line['description'],
                ]);
            }

            // ── 6. Post GL entries ────────────────────────────────────────────
            $accounts   = $this->coaService->getStandardAccounts();
            $glEntries  = [];
            $invoiceRef = "فاتورة خدمات #{$invoice->invoice_number}";

            // Debit: Cash or Accounts Receivable
            $debitAccount = ($paymentType === 'cash')
                ? $accounts['cash']
                : $accounts['accounts_receivable'];

            $glEntries[] = [
                'account_code' => $debitAccount,
                'entry_type'   => 'DEBIT',
                'amount'       => $totalAmount,
                'description'  => $invoiceRef,
            ];

            // Credit: Service Revenue
            $glEntries[] = [
                'account_code' => $accounts['service_revenue'],
                'entry_type'   => 'CREDIT',
                'amount'       => $subtotal - $discountAmount,
                'description'  => $invoiceRef,
            ];

            // Credit: Output VAT (if applicable)
            if ($vatAmount > 0) {
                $glEntries[] = [
                    'account_code' => $accounts['output_vat'],
                    'entry_type'   => 'CREDIT',
                    'amount'       => $vatAmount,
                    'description'  => "ضريبة القيمة المضافة - {$invoiceRef}",
                ];
            }

            // Credit: Discount contra (if applicable)
            if ($discountAmount > 0) {
                $glEntries[] = [
                    'account_code' => $accounts['sales_discount'],
                    'entry_type'   => 'DEBIT',
                    'amount'       => $discountAmount,
                    'description'  => "خصم - {$invoiceRef}",
                ];
            }

            $this->ledgerService->postTransaction(
                $glEntries,
                'invoices',
                $invoice->id,
                $voucherNumber,
                now()->format('Y-m-d')
            );

            // ── 7. Create AR transaction for credit sales ─────────────────────
            if ($paymentType === 'credit' && $customerId) {
                ArTransaction::create([
                    'customer_id'    => $customerId,
                    'type'           => 'invoice',
                    'voucher_number' => $voucherNumber,
                    'description'    => $invoiceRef,
                    'reference_type' => 'invoices',
                    'reference_id'   => $invoice->id,
                    'created_by'     => $userId,
                ]);

                ArCustomer::where('id', $customerId)
                    ->increment('current_balance', $totalAmount);
            }

            Log::info("Service sale created", ['invoice_id' => $invoice->id, 'payment_type' => $paymentType]);

            return $invoice->id;
        });
    }
}
