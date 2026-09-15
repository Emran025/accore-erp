<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\OrganizationGovernance;

use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\AnalyzeInferenceAction;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\GetAdaptiveQuestionsAction;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Controllers\Controller;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\AnalyzeInferenceRequest;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\GetAdaptiveQuestionsRequest;
use App\Http\Resources\EnterpriseCore\OrganizationGovernance\InferenceAnalysisResource;
use Illuminate\Http\JsonResponse;

/**
 * Handles conversational onboarding inference, natural language signal extraction,
 * archetype evaluation, explainability synthesis, and adaptive questionnaire generation.
 */
class SetupInferenceController extends Controller
{
    use BaseApiController;

    /**
     * Analyze business description and structured onboarding answers to recommend
     * an organizational archetype and synthesize an initial blueprint.
     */
    public function analyze(AnalyzeInferenceRequest $request, AnalyzeInferenceAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());

        return $this->successResponse(
            new InferenceAnalysisResource($result),
            'Business signals analyzed successfully.'
        );
    }

    /**
     * Get targeted adaptive follow-up questions for refinement.
     */
    public function adaptiveQuestions(GetAdaptiveQuestionsRequest $request, GetAdaptiveQuestionsAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());

        return $this->successResponse($result, 'Adaptive questions generated.');
    }
}
