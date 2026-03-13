<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\TalentDevelopment;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\TalentDevelopment\StorePerformanceGoalRequest;
use App\Http\Requests\HumanCapital\TalentDevelopment\UpdatePerformanceGoalRequest;
use App\Http\Requests\HumanCapital\TalentDevelopment\StorePerformanceAppraisalRequest;
use App\Http\Requests\HumanCapital\TalentDevelopment\UpdatePerformanceAppraisalRequest;
use App\Http\Requests\HumanCapital\TalentDevelopment\StoreContinuousFeedbackRequest;
use App\Domains\HumanCapital\TalentDevelopment\Actions\ListPerformanceGoalsAction;
use App\Domains\HumanCapital\TalentDevelopment\Actions\CreatePerformanceGoalAction;
use App\Domains\HumanCapital\TalentDevelopment\Actions\UpdatePerformanceGoalAction;
use App\Domains\HumanCapital\TalentDevelopment\Actions\ListPerformanceAppraisalsAction;
use App\Domains\HumanCapital\TalentDevelopment\Actions\CreatePerformanceAppraisalAction;
use App\Domains\HumanCapital\TalentDevelopment\Actions\UpdatePerformanceAppraisalAction;
use App\Domains\HumanCapital\TalentDevelopment\Actions\ListContinuousFeedbackAction;
use App\Domains\HumanCapital\TalentDevelopment\Actions\CreateContinuousFeedbackAction;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class PerformanceController extends Controller
{
    use BaseApiController;

    // Goals
    public function indexGoals(Request $request, ListPerformanceGoalsAction $action)
    {
        $filters = $request->only(['employee_id', 'goal_type', 'status']);
        $goals = $action->execute($filters);

        return $this->successResponse($goals);
    }

    public function storeGoal(StorePerformanceGoalRequest $request, CreatePerformanceGoalAction $action)
    {
        $validated = $request->validated();
        $goal = $action->execute($validated);

        return response()->json(array_merge(['success' => true], $goal), 201);
    }

    public function updateGoal(UpdatePerformanceGoalRequest $request, $id, UpdatePerformanceGoalAction $action)
    {
        $validated = $request->validated();
        $goal = $action->execute($id, $validated);

        return $this->successResponse($goal);
    }

    // Appraisals
    public function indexAppraisals(Request $request, ListPerformanceAppraisalsAction $action)
    {
        $filters = $request->only(['employee_id', 'appraisal_type', 'status']);
        $appraisals = $action->execute($filters);

        return $this->successResponse($appraisals);
    }

    public function storeAppraisal(StorePerformanceAppraisalRequest $request, CreatePerformanceAppraisalAction $action)
    {
        $validated = $request->validated();
        $appraisal = $action->execute($validated);

        return response()->json(array_merge(['success' => true], $appraisal), 201);
    }

    public function updateAppraisal(UpdatePerformanceAppraisalRequest $request, $id, UpdatePerformanceAppraisalAction $action)
    {
        $validated = $request->validated();
        $appraisal = $action->execute($id, $validated);

        return $this->successResponse($appraisal);
    }

    // Continuous Feedback
    public function indexFeedback(Request $request, ListContinuousFeedbackAction $action)
    {
        $filters = $request->only(['employee_id', 'feedback_type']);
        $feedback = $action->execute($filters);

        return $this->successResponse($feedback);
    }

    public function storeFeedback(StoreContinuousFeedbackRequest $request, CreateContinuousFeedbackAction $action)
    {
        $validated = $request->validated();
        $feedback = $action->execute($validated);

        return response()->json(array_merge(['success' => true], $feedback), 201);
    }
}
