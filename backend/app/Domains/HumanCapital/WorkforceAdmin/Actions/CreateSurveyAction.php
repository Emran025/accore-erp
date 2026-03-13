<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\Communications\Models\PulseSurvey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class CreateSurveyAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'survey_name' => 'required|string|max:255', 'description' => 'nullable|string',
            'survey_type' => 'required|in:sentiment,burnout,engagement,custom',
            'questions' => 'required|array', 'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date', 'is_anonymous' => 'boolean',
            'target_audience' => 'required|in:all,department,role,location',
            'target_departments' => 'nullable|array', 'target_roles' => 'nullable|array',
        ]);
        $validated['is_active'] = true;
        $validated['created_by'] = auth()->id();
        $survey = PulseSurvey::create($validated);
        return response()->json(array_merge(['success' => true], $survey->toArray()), 201);
    }
}
