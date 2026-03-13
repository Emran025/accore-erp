<?php
namespace App\Domains\Finance\FiscalPeriods\Actions;
use App\Domains\Finance\FiscalPeriods\Models\FiscalPeriod;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class ListFiscalPeriodsAction
{
    public function execute(): array
    {
        PermissionService::requirePermission('fiscal_periods', 'view');
        return FiscalPeriod::orderBy('start_date', 'desc')->get()->toArray();
    }
}
