<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\ExpatManagement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateExpatRecordAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'employee_id' => 'required|exists:employees,id',
            'passport_number' => 'nullable|string|max:50',
            'passport_expiry' => 'nullable|date',
            'visa_number' => 'nullable|string|max:50',
            'visa_expiry' => 'nullable|date',
            'work_permit_number' => 'nullable|string|max:50',
            'work_permit_expiry' => 'nullable|date',
            'residency_number' => 'nullable|string|max:50',
            'residency_expiry' => 'nullable|date',
            'host_country' => 'nullable|string|max:100',
            'home_country' => 'nullable|string|max:100',
            'cost_of_living_adjustment' => 'nullable|numeric|min:0',
            'housing_allowance' => 'nullable|numeric|min:0',
            'relocation_package' => 'nullable|numeric|min:0',
            'tax_equalization' => 'boolean',
            'repatriation_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $validated['created_by'] = auth()->id();
        $expat = ExpatManagement::create($validated);
        
        return response()->json(array_merge(['success' => true], $expat->load('employee')->toArray()), 201);
    }
}
