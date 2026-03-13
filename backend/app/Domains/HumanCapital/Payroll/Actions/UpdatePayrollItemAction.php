<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\Payroll\Services\PayrollService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdatePayrollItemAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly PayrollService $payrollService,
        private readonly int $itemId
    ) {}

    public function __invoke(): JsonResponse
    {
        $this->request->validate([
            'base_salary' => 'required|numeric|min:0',
            'total_allowances' => 'required|numeric|min:0',
            'total_deductions' => 'required|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        try {
            $item = $this->payrollService->updatePayrollItem($this->itemId, $this->request->all());
            return $this->successResponse($item->toArray(), 'Payroll item updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}
