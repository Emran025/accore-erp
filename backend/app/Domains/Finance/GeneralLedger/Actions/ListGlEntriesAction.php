<?php
namespace App\Domains\Finance\GeneralLedger\Actions;

use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
class ListGlEntriesAction
{
    public function execute(array $filters): array
    {
        PermissionService::requirePermission('general_ledger', 'view');

        $page = max(1, (int)($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int)($filters['per_page'] ?? 50)));
        $startDate = $filters['start_date'] ?? $filters['date_from'] ?? null;
        $endDate = $filters['end_date'] ?? $filters['date_to'] ?? null;
        $voucherNumber = $filters['voucher_number'] ?? null;
        $accountCode = $filters['account_code'] ?? null;

        $query = GeneralLedger::with(['account', 'createdBy'])
            ->where('is_closed', false);

        if ($startDate) {
            $query->where('voucher_date', '>=', $startDate);
        }

        if ($endDate) {
            $query->where('voucher_date', '<=', $endDate);
        }

        if ($voucherNumber) {
            $query->where('voucher_number', 'like', "%$voucherNumber%");
        }

        if ($accountCode) {
            $account = ChartOfAccount::where('account_code', $accountCode)->first();
            if ($account) {
                $query->where('account_id', $account->id);
            }
        }

        $total = $query->count();
        
        $entries = $query->orderBy('voucher_date', 'desc')
            ->orderBy('voucher_number', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'entry_number' => $entry->voucher_number,
                    'entry_date' => $entry->voucher_date?->format('Y-m-d'),
                    'account_code' => $entry->account?->account_code,
                    'account_name' => $entry->account?->account_name,
                    'debit_account' => $entry->entry_type === 'DEBIT' ? $entry->account?->account_name : '-',
                    'credit_account' => $entry->entry_type === 'CREDIT' ? $entry->account?->account_name : '-',
                    'entry_type' => $entry->entry_type,
                    'amount' => (float)$entry->amount,
                    'description' => $entry->description,
                    'reference' => $entry->reference_type ? "{$entry->reference_type} #{$entry->reference_id}" : '-',
                    'created_by' => $entry->createdBy?->username,
                    'created_at' => $entry->created_at?->toDateTimeString(),
                ];
            });

        return [
            'entries' => $entries,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage
        ];
    }
}
