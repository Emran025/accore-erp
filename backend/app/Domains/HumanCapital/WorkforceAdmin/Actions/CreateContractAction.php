<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\EmployeeContract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateContractAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'employee_id' => 'required|exists:employees,id',
            'contract_start_date' => 'required|date',
            'contract_end_date' => 'nullable|date|after_or_equal:contract_start_date',
            'probation_end_date' => 'nullable|date|after_or_equal:contract_start_date',
            'base_salary' => 'required|numeric|min:0',
            'signing_bonus' => 'nullable|numeric|min:0',
            'retention_allowance' => 'nullable|numeric|min:0',
            'contract_type' => 'required|in:full_time,part_time,contract,freelance',
            'working_hours_per_day' => 'nullable|integer|min:1|max:24',
            'working_days_per_week' => 'nullable|integer|min:1|max:7',
            'nda_signed' => 'boolean',
            'non_compete_signed' => 'boolean',
            'contract_file_path' => 'nullable|string',
            'notes' => 'nullable|string',
            'is_current' => 'boolean',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['contract_number'] = $validated['contract_number'] ?? ('CTR-' . date('Ymd') . '-' . str_pad(EmployeeContract::count() + 1, 5, '0', STR_PAD_LEFT));
        $validated['renewal_reminder_sent'] = false;

        $contract = EmployeeContract::create($validated);

        if (($validated['is_current'] ?? false) === true) {
            EmployeeContract::where('employee_id', $validated['employee_id'])
                ->where('id', '!=', $contract->id)
                ->update(['is_current' => false]);
        }

        return response()->json(array_merge(['success' => true], $contract->load(['employee', 'creator'])->toArray()), 201);
    }
}
