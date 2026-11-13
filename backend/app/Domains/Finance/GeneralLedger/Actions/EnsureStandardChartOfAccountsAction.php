<?php

namespace App\Domains\Finance\GeneralLedger\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
use App\Domains\Finance\GeneralLedger\Services\StandardChartOfAccountsService;

class EnsureStandardChartOfAccountsAction
{
    public function __construct(
        private readonly StandardChartOfAccountsService $chartOfAccounts,
    ) {}

    public function execute(): int
    {
        PermissionService::requirePermission('chart_of_accounts', 'create');

        return $this->chartOfAccounts->seedStandardChart(updateExisting: false);
    }
}
