<?php

namespace App\Domains\HumanCapital\TalentDevelopment\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TalentDevelopment\Models\PerformanceAppraisal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateAppraisalAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'employee_id' => 'required|exists:employees,id',
            'appraisal_type' => 'required|in:self,manager,peer,360,annual,mid_year',
            'appraisal_period' => 'required|string|max:50',
            'appraisal_date' => 'required|date',
            'manager_id' => 'nullable|exists:employees,id',
            'ratings' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $validated['appraisal_number'] = 'APP-' . date('Ymd') . '-' . str_pad(PerformanceAppraisal::count() + 1, 4, '0', STR_PAD_LEFT);
        $validated['status'] = 'draft';
        $validated['ratings'] = $validated['ratings'] ?? [];

        $appraisal = PerformanceAppraisal::create($validated);
        return response()->json(array_merge(['success' => true], $appraisal->load('employee')->toArray()), 201);
    }
}
