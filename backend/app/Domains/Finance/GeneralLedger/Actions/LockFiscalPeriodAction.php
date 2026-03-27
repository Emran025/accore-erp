<?php
namespace App\Domains\Finance\GeneralLedger\Actions;

use App\Domains\Finance\GeneralLedger\Models\FiscalPeriod;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class LockFiscalPeriodAction
{
    public function execute(int $id): FiscalPeriod
    {
        PermissionService::requirePermission('fiscal_periods', 'edit');

        $period = FiscalPeriod::findOrFail($id);

        if ($period->is_locked) {
            throw new \Exception('Period is already locked', 400);
        }

        $period->update([
            'is_locked' => true,
            'locked_at' => now(),
            'locked_by' => auth()->id() ?? session('user_id'),
        ]);

        return $period;
    }
}
