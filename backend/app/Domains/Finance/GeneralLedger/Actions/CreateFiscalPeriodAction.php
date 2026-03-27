<?php
namespace App\Domains\Finance\GeneralLedger\Actions;
use App\Domains\Finance\GeneralLedger\Models\FiscalPeriod;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
class CreateFiscalPeriodAction
{
    public function execute(array $data): FiscalPeriod
    {
        PermissionService::requirePermission('fiscal_periods', 'create');

        // Check for overlapping periods
        $overlap = FiscalPeriod::where(function ($query) use ($data) {
            $query->whereBetween('start_date', [$data['start_date'], $data['end_date']])
                ->orWhereBetween('end_date', [$data['start_date'], $data['end_date']])
                ->orWhere(function ($q) use ($data) {
                    $q->where('start_date', '<=', $data['start_date'])
                      ->where('end_date', '>=', $data['end_date']);
                });
        })->exists();

        if ($overlap) {
            throw new \Exception('Period overlaps with an existing fiscal period', 409);
        }

        return FiscalPeriod::create([
            'period_name' => $data['period_name'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'is_closed' => false,
            'is_locked' => false,
            'created_by' => auth()->id() ?? session('user_id'),
        ]);
    }
}
