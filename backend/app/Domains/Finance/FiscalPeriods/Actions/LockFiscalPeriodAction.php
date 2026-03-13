<?php
namespace App\Domains\Finance\FiscalPeriods\Actions;

use App\Domains\Finance\FiscalPeriods\Models\FiscalPeriod;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class LockFiscalPeriodAction
{
    public function execute(int $id): array
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

        return ['message' => 'Fiscal period locked successfully'];
    }
}
