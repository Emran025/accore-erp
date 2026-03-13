<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\EmployeeContract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateContractAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $id) {}

    public function __invoke(): JsonResponse
    {
        $contract = EmployeeContract::findOrFail($this->id);

        $validated = $this->request->validate([
            'contract_start_date' => 'date',
            'contract_end_date' => 'nullable|date',
            'probation_end_date' => 'nullable|date',
            'base_salary' => 'numeric|min:0',
            'signing_bonus' => 'nullable|numeric|min:0',
            'retention_allowance' => 'nullable|numeric|min:0',
            'contract_type' => 'in:full_time,part_time,contract,freelance',
            'working_hours_per_day' => 'nullable|integer|min:1|max:24',
            'working_days_per_week' => 'nullable|integer|min:1|max:7',
            'is_current' => 'boolean',
            'nda_signed' => 'boolean',
            'non_compete_signed' => 'boolean',
            'contract_file_path' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $contract->update($validated);

        if ($this->request->has('is_current') && $this->request->boolean('is_current') === true) {
            EmployeeContract::where('employee_id', $contract->employee_id)
                ->where('id', '!=', $contract->id)
                ->update(['is_current' => false]);
        }

        return $this->successResponse($contract->load(['employee', 'creator'])->toArray());
    }
}
