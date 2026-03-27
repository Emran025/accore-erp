<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use Illuminate\Support\Collection;

class ListJournalVouchersAction
{
    public function execute(array $filters): Collection
    {

        $page = max(1, (int)($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int)($filters['per_page'] ?? $filters['limit'] ?? 20)));
        $voucherNumber = $filters['voucher_number'] ?? null;

        $query = GeneralLedger::query()->where('entry_source', 'MANUAL');
        if ($voucherNumber) {
            $query->where('voucher_number', 'like', "%$voucherNumber%");
        }

        $uniqueVoucherCount = $query->distinct('voucher_number')->count('voucher_number');
        $pagedVoucherNumbers = $query->distinct('voucher_number')
            ->orderBy('voucher_number', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->pluck('voucher_number');

        $allEntries = GeneralLedger::whereIn('voucher_number', $pagedVoucherNumbers)
            ->with(['account', 'createdBy', 'costCenter', 'profitCenter'])
            ->orderBy('voucher_number', 'desc')
            ->orderBy('id')
            ->get()
            ->groupBy('voucher_number');

        $vouchers = $pagedVoucherNumbers->map(function ($vNum) use ($allEntries) {
            $entries = $allEntries->get($vNum);
            $first = $entries->first();
            return [
                'id' => $vNum,
                'voucher_number' => $vNum,
                'voucher_date' => $first->voucher_date?->format('Y-m-d'),
                'description' => $first->description,
                'total_debit' => (float) $entries->where('entry_type', 'DEBIT')->sum('amount'),
                'total_credit' => (float) $entries->where('entry_type', 'CREDIT')->sum('amount'),
                'status' => 'posted',
                'created_by_name' => $first->createdBy?->username,
                'created_at' => $first->created_at?->toDateTimeString(),
                'lines' => $entries->map(fn($e) => [
                    'id' => $e->id,
                    'account_id' => $e->account_id,
                    'account_name' => $e->account?->account_name,
                    'debit' => $e->entry_type === 'DEBIT' ? (float) $e->amount : 0,
                    'credit' => $e->entry_type === 'CREDIT' ? (float) $e->amount : 0,
                    'description' => $e->description,
                    'cost_center_id' => $e->cost_center_id,
                    'cost_center_name' => $e->costCenter?->name,
                    'profit_center_id' => $e->profit_center_id,
                    'profit_center_name' => $e->profitCenter?->name,
                ]),
            ];
        });

        return collect([
            'vouchers' => $vouchers,
            'total' => $uniqueVoucherCount,
            'page' => $page,
            'per_page' => $perPage,
        ]);
    }
}
