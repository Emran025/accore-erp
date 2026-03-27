<?php
namespace App\Domains\Finance\GeneralLedger\Actions;

use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListGlEntriesAction
{
    public function execute(array $filters): LengthAwarePaginator
    {
        PermissionService::requirePermission('general_ledger', 'view');

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

        return $query->orderBy('voucher_date', 'desc')
            ->orderBy('voucher_number', 'desc')
            ->paginate($perPage);
    }
}
