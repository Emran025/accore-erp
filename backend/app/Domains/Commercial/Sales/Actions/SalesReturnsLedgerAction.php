<?php

namespace App\Domains\Commercial\Sales\Actions;

use App\Domains\Commercial\Sales\Models\SalesReturn;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;

class SalesReturnsLedgerAction
{
    public function execute(array $filters): array
    {
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 20)));
        $offset = ($page - 1) * $perPage;

        $query = SalesReturn::with(['invoice.customer', 'user', 'items.product'])
            ->join('invoices', 'sales_returns.invoice_id', '=', 'invoices.id')
            ->leftJoin('ar_customers', 'invoices.customer_id', '=', 'ar_customers.id')
            ->select('sales_returns.*', 'invoices.invoice_number', 'invoices.payment_type', 'invoices.customer_id', 'ar_customers.name as customer_name');

        if ($search = ($filters['search'] ?? null)) {
            $query->where(function ($q) use ($search) {
                $q->where('sales_returns.reason', 'like', "%{$search}%")
                  ->orWhere('sales_returns.return_number', 'like', "%{$search}%")
                  ->orWhere('invoices.invoice_number', 'like', "%{$search}%")
                  ->orWhere('ar_customers.name', 'like', "%{$search}%")
                  ->orWhere('sales_returns.voucher_number', 'like', "%{$search}%");
            });
        }

        if ($type = ($filters['type'] ?? null)) {
            $query->where('invoices.payment_type', $type);
        }

        if ($dateFrom = ($filters['date_from'] ?? null)) {
            $query->whereDate('sales_returns.created_at', '>=', $dateFrom);
        }

        if ($dateTo = ($filters['date_to'] ?? null)) {
            $query->whereDate('sales_returns.created_at', '<=', $dateTo);
        }

        $returnVouchers = (clone $query)->pluck('sales_returns.voucher_number')->filter()->toArray();
        $totalReturns = 0;
        if (!empty($returnVouchers)) {
            $totalReturns = (float) GeneralLedger::whereIn('voucher_number', $returnVouchers)
                ->where('entry_type', 'DEBIT')
                ->sum('amount');
        }

        $transactionCount = $query->count();
        $returns = $query->orderBy('sales_returns.created_at', 'desc')
            ->skip($offset)
            ->take($perPage)
            ->get();

        $data = $returns->map(fn($r) => [
            'id' => $r->id,
            'type' => 'return',
            'amount' => (float) $r->total_amount,
            'description' => $r->reason ?? ('Return for invoice #' . $r->invoice_number),
            'reference_type' => 'sales_returns',
            'reference_id' => $r->id,
            'invoice_number' => $r->return_number ?? ('RTN-' . $r->id),
            'transaction_date' => $r->created_at?->toDateTimeString(),
            'created_at' => $r->created_at?->toDateTimeString(),
            'created_by' => $r->user?->username ?? null,
            'is_deleted' => false,
            'payment_type' => $r->payment_type,
            'customer_id' => $r->customer_id,
            'customer_name' => $r->customer_name,
            'related_invoice_number' => $r->invoice_number,
            'total_amount' => (float) $r->total_amount,
            'subtotal' => (float) $r->subtotal,
            'vat_amount' => (float) $r->vat_amount,
            'discount_amount' => 0,
        ]);

        return [
            'data' => $data,
            'stats' => [
                'total_debit' => 0,
                'total_credit' => (float) $totalReturns,
                'total_returns' => (float) $totalReturns,
                'total_cash_returns' => 0,
                'total_credit_returns' => 0,
                'total_receipts' => 0,
                'balance' => 0,
                'transaction_count' => $transactionCount
            ],
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total_records' => $transactionCount,
                'total_pages' => $transactionCount > 0 ? ceil($transactionCount / $perPage) : 1
            ],
        ];
    }
}
