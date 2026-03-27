<?php

namespace App\Domains\Finance\GeneralLedger\Actions;

use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
use Illuminate\Database\Eloquent\Collection;
class ListChartOfAccountsAction
{
    public function __construct(
        private readonly LedgerService $ledgerService
    ) {}

    public function execute(array $filters): Collection
    {
        PermissionService::requirePermission('chart_of_accounts', 'view');
        $search = $filters['search'] ?? null;

        $query = ChartOfAccount::with('parent');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('account_code', 'like', "%$search%")
                  ->orWhere('account_name', 'like', "%$search%");
            });
        }

        return $query->orderBy('account_code')->get();
    }
}
