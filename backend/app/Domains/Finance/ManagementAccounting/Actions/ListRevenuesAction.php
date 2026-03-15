<?php
namespace App\Domains\Finance\ManagementAccounting\Actions;

use App\Domains\Finance\ManagementAccounting\Models\Revenue;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class ListRevenuesAction
{
    public function execute(array $filters): array
    {
        PermissionService::requirePermission('revenues', 'view');

        $page = max(1, (int)($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int)($filters['per_page'] ?? $filters['limit'] ?? 20)));

        $query = Revenue::with('user');

        $total = $query->count();
        $revenues = $query->orderBy('revenue_date', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(function ($revenue) {
                // Derive amount from GL (single source of truth)
                $glAmount = GeneralLedger::where('voucher_number', $revenue->voucher_number)
                    ->where('entry_type', 'CREDIT')
                    ->sum('amount');
                $revenue->setAttribute('gl_amount', (float) $glAmount);
                return $revenue;
            });

        return [
            'items' => $revenues->toArray(),
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
        ];
    }
}
