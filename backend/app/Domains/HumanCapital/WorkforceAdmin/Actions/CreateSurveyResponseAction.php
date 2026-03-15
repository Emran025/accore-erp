<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\HRCompliance\Models\PulseSurvey;
use App\Domains\HumanCapital\HRCompliance\Models\SurveyResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class CreateSurveyResponseAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $surveyId) {}
    public function __invoke(): JsonResponse
    {
        $survey = PulseSurvey::findOrFail($this->surveyId);
        $validated = $this->request->validate(['responses' => 'required|array']);
        $validated['survey_id'] = $this->surveyId;
        $validated['employee_id'] = $survey->is_anonymous ? null : auth()->id();
        $validated['submitted_at'] = now();
        $response = SurveyResponse::create($validated);
        return response()->json(array_merge(['success' => true], $response->toArray()), 201);
    }
}
