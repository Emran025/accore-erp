<?php
namespace App\Domains\Finance\GeneralLedger\Actions;

use App\Domains\Finance\GeneralLedger\Models\FiscalPeriod;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class UnlockFiscalPeriodAction
{
    public function execute(int $id): FiscalPeriod
    {
        PermissionService::requirePermission('fiscal_periods', 'edit');

        $period = FiscalPeriod::findOrFail($id);

        if (!$period->is_locked) {
            throw new \Exception('Period is not locked', 400);
        }

        if ($period->is_closed) {
            throw new \Exception('Cannot unlock a closed period', 400);
        }

        $period->update([
            'is_locked' => false,
            'locked_at' => null,
            'locked_by' => null,
        ]);

        return $period;
    }
}
