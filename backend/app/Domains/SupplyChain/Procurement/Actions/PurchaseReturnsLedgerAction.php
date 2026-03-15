<?php

namespace App\Domains\SupplyChain\Procurement\Actions;

use App\Domains\SupplyChain\PayablesExpenses\Models\ApTransaction;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;

class PurchaseReturnsLedgerAction
{
    public function execute(array $filters): array
    {
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 20)));
        $offset = ($page - 1) * $perPage;

        $query = ApTransaction::with(['supplier', 'createdBy'])
            ->leftJoin('purchases', function($join) {
                $join->on('ap_transactions.reference_id', '=', 'purchases.id')
                     ->where('ap_transactions.reference_type', '=', 'purchases');
            })
            ->leftJoin('ap_suppliers', 'ap_transactions.supplier_id', '=', 'ap_suppliers.id')
            ->where('ap_transactions.type', 'return')
            ->where('ap_transactions.is_deleted', false)
            ->select(
                'ap_transactions.*',
                'purchases.payment_type',
                'purchases.invoice_price',
                'purchases.voucher_number',
                'ap_suppliers.name as supplier_name'
            );

        if ($search = ($filters['search'] ?? null)) {
            $query->where(function ($q) use ($search) {
                $q->where('ap_transactions.description', 'like', "%{$search}%")
                  ->orWhere('ap_suppliers.name', 'like', "%{$search}%")
                  ->orWhere('purchases.voucher_number', 'like', "%{$search}%")
                  ->orWhere('ap_transactions.voucher_number', 'like', "%{$search}%");
            });
        }

        if ($type = ($filters['type'] ?? null)) {
            $query->where('purchases.payment_type', $type);
        }

        if ($dateFrom = ($filters['date_from'] ?? null)) {
            $query->whereDate('ap_transactions.transaction_date', '>=', $dateFrom);
        }

        if ($dateTo = ($filters['date_to'] ?? null)) {
            $query->whereDate('ap_transactions.transaction_date', '<=', $dateTo);
        }

        $returnVouchers = (clone $query)->pluck('ap_transactions.voucher_number')->filter()->toArray();
        $totalReturns = 0;
        if (!empty($returnVouchers)) {
            $totalReturns = GeneralLedger::whereIn('voucher_number', $returnVouchers)
                ->where('entry_type', 'DEBIT')
                ->sum('amount');
        }

        $transactionCount = $query->count();
        $returns = $query->orderBy('ap_transactions.transaction_date', 'desc')
            ->skip($offset)
            ->take($perPage)
            ->get();

        $data = $returns->map(function ($r) {
            $amount = $r->voucher_number ? (float) GeneralLedger::where('voucher_number', $r->voucher_number)
                ->where('entry_type', 'DEBIT')
                ->sum('amount') : 0;

            return [
                'id' => $r->id,
                'type' => 'return',
                'amount' => $amount,
                'description' => $r->description,
                'reference_type' => $r->reference_type,
                'reference_id' => $r->reference_id,
                'transaction_date' => $r->transaction_date,
                'created_at' => $r->created_at?->toDateTimeString(),
                'created_by' => $r->createdBy?->name ?? null,
                'is_deleted' => false,
                'payment_type' => $r->payment_type,
                'supplier_id' => $r->supplier_id,
                'supplier_name' => $r->supplier_name,
                'related_invoice_number' => $r->voucher_number,
                'invoice_number' => $r->voucher_number ?? ('PR-' . $r->reference_id),
            ];
        });

        return [
            'data' => $data,
            'stats' => [
                'total_returns' => (float) $totalReturns,
                'total_cash_returns' => 0,
                'total_credit_returns' => 0,
                'transaction_count' => $transactionCount,
            ],
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total_records' => $transactionCount,
                'total_pages' => $transactionCount > 0 ? ceil($transactionCount / $perPage) : 1,
            ],
        ];
    }
}
