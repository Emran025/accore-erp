<?php
namespace App\Domains\Finance\FiscalPeriods\Actions;

use App\Domains\Finance\FiscalPeriods\Models\FiscalPeriod;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class UnlockFiscalPeriodAction
{
    public function execute(int $id): array
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

        return ['message' => 'Fiscal period unlocked successfully'];
    }
}
