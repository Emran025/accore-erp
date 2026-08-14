<?php

namespace App\Domains\Commercial\SalesLifecycle\Services;

use App\Domains\Commercial\SalesLifecycle\Models\SalesQuotation;
use App\Domains\SupplyChain\Inventory\Models\Product;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SalesQuotationService
{
    public function create(array $data, ?int $userId = null): SalesQuotation
    {
        return DB::transaction(function () use ($data, $userId) {
            $totals = $this->calculateTotals($data['items'], (float) ($data['discount_amount'] ?? 0), (float) ($data['tax_rate'] ?? 0));

            $quotation = SalesQuotation::create([
                ...Arr::except($data, ['items']),
                'quote_number' => $data['quote_number'] ?? $this->generateQuoteNumber(),
                'subtotal' => $totals['subtotal'],
                'discount_amount' => $totals['discount_amount'],
                'tax_amount' => $totals['tax_amount'],
                'total_amount' => $totals['total_amount'],
                'created_by' => $userId,
            ]);

            $this->storeItems($quotation, $data['items']);

            return $quotation->load(['items.product', 'customer', 'warehouse', 'createdBy']);
        });
    }

    public function update(SalesQuotation $quotation, array $data): SalesQuotation
    {
        return DB::transaction(function () use ($quotation, $data) {
            $items = $data['items'] ?? $quotation->items()->get()->map(fn ($item) => $item->only([
                'product_id', 'sku', 'description', 'unit', 'quantity', 'unit_price', 'discount_amount', 'is_optional', 'sort_order',
            ]))->all();
            $totals = $this->calculateTotals($items, (float) ($data['discount_amount'] ?? $quotation->discount_amount), (float) ($data['tax_rate'] ?? $quotation->tax_rate));

            $quotation->update([
                ...Arr::except($data, ['items', 'quote_number']),
                'subtotal' => $totals['subtotal'],
                'discount_amount' => $totals['discount_amount'],
                'tax_amount' => $totals['tax_amount'],
                'total_amount' => $totals['total_amount'],
            ]);

            if (array_key_exists('items', $data)) {
                $quotation->items()->delete();
                $this->storeItems($quotation, $data['items']);
            }

            return $quotation->fresh(['items.product', 'customer', 'warehouse', 'createdBy']);
        });
    }

    public function updateStatus(SalesQuotation $quotation, string $status): SalesQuotation
    {
        $attributes = ['status' => $status];

        if ($status === 'sent' && !$quotation->sent_at) {
            $attributes['sent_at'] = now();
        }

        if ($status === 'accepted' && !$quotation->accepted_at) {
            $attributes['accepted_at'] = now();
        }

        $quotation->update($attributes);

        return $quotation->fresh(['items.product', 'customer', 'warehouse', 'createdBy']);
    }

    private function storeItems(SalesQuotation $quotation, array $items): void
    {
        foreach ($items as $index => $item) {
            $product = !empty($item['product_id']) ? Product::find($item['product_id']) : null;
            $quantity = (float) $item['quantity'];
            $unitPrice = (float) $item['unit_price'];
            $discountAmount = (float) ($item['discount_amount'] ?? 0);

            $quotation->items()->create([
                'product_id' => $item['product_id'] ?? null,
                'sku' => $item['sku'] ?? $product?->barcode,
                'description' => $item['description'] ?? $product?->name,
                'unit' => $item['unit'] ?? $product?->sub_unit_name,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'discount_amount' => $discountAmount,
                'line_total' => max(0, ($quantity * $unitPrice) - $discountAmount),
                'is_optional' => (bool) ($item['is_optional'] ?? false),
                'sort_order' => $item['sort_order'] ?? $index,
            ]);
        }
    }

    private function calculateTotals(array $items, float $documentDiscount, float $taxRate): array
    {
        $subtotal = 0.0;

        foreach ($items as $item) {
            if (!($item['is_optional'] ?? false)) {
                $subtotal += max(0, ((float) $item['quantity'] * (float) $item['unit_price']) - (float) ($item['discount_amount'] ?? 0));
            }
        }

        $discountAmount = min(max(0, $documentDiscount), $subtotal);
        $taxableAmount = $subtotal - $discountAmount;
        $taxAmount = round($taxableAmount * (max(0, $taxRate) / 100), 2);

        return [
            'subtotal' => round($subtotal, 2),
            'discount_amount' => round($discountAmount, 2),
            'tax_amount' => $taxAmount,
            'total_amount' => round($taxableAmount + $taxAmount, 2),
        ];
    }

    private function generateQuoteNumber(): string
    {
        do {
            $number = sprintf('QT-%s-%s', now()->format('Y'), Str::upper(Str::random(6)));
        } while (SalesQuotation::where('quote_number', $number)->exists());

        return $number;
    }
}
