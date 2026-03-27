<?php
namespace App\Domains\Finance\GeneralLedger\Actions;
use App\Domains\Finance\GeneralLedger\Models\FiscalPeriod;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
use Illuminate\Database\Eloquent\Collection;
class ListFiscalPeriodsAction
{
    public function execute(): Collection
    {
        PermissionService::requirePermission('fiscal_periods', 'view');
        return FiscalPeriod::orderBy('start_date', 'desc')->get();
    }
}
