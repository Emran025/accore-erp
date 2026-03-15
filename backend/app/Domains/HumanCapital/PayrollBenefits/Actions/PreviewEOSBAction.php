<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;
use App\Domains\HumanCapital\PayrollBenefits\Services\EOSBCalculatorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PreviewEOSBAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly EOSBCalculatorService $eosbCalculator
    ) {}

    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'employee_id' => 'required|exists:employees,id',
            'termination_date' => 'required|date',
            'termination_reason' => 'required|in:resignation,termination,end_of_contract'
        ]);

        try {
            $employee = Employee::findOrFail($validated['employee_id']);
            
            $calculation = $this->eosbCalculator->calculate(
                $employee,
                $validated['termination_date'],
                $validated['termination_reason']
            );

            return response()->json($calculation);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
