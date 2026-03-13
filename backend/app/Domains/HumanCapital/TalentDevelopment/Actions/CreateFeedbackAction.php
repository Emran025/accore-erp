<?php

namespace App\Domains\HumanCapital\TalentDevelopment\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TalentDevelopment\Models\ContinuousFeedback;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateFeedbackAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'employee_id' => 'required|exists:employees,id',
            'feedback_type' => 'required|in:check_in,praise,improvement,coaching,other',
            'feedback_content' => 'required|string',
            'feedback_date' => 'required|date',
            'is_visible_to_employee' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $validated['given_by'] = auth()->id();

        $feedback = ContinuousFeedback::create($validated);
        return response()->json(array_merge(['success' => true], $feedback->load('employee', 'givenBy')->toArray()), 201);
    }
}
