<?php
namespace App\Domains\Finance\FiscalPeriods\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\FiscalPeriods\Models\FiscalPeriod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;
class CreateFiscalPeriodAction
{
    public function execute(array $data): array
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

        $period = FiscalPeriod::create([
            'period_name' => $data['period_name'],
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'is_closed' => false,
            'is_locked' => false,
            'created_by' => auth()->id() ?? session('user_id'),
        ]);

        return ['id' => $period->id];
    }
}
