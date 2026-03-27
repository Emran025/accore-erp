<?php
namespace App\Domains\Finance\ManagementAccounting\Actions;

use App\Domains\Finance\ManagementAccounting\Models\Revenue;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
use Illuminate\Pagination\LengthAwarePaginator;

class ListRevenuesAction
{
    public function execute(array $filters): LengthAwarePaginator
    {
        PermissionService::requirePermission('revenues', 'view');

        $perPage = min(100, max(1, (int)($filters['per_page'] ?? $filters['limit'] ?? 20)));

        $query = Revenue::with('user');

        $paginator = $query->orderBy('revenue_date', 'desc')->paginate($perPage);

        $paginator->getCollection()->map(function ($revenue) {
            $glAmount = GeneralLedger::where('voucher_number', $revenue->voucher_number)
                ->where('entry_type', 'CREDIT')
                ->sum('amount');
            $revenue->setAttribute('gl_amount', (float) $glAmount);
            return $revenue;
        });

        return $paginator;
    }
}
