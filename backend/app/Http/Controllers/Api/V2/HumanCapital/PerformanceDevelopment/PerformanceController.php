<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\PerformanceDevelopment;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\PerformanceDevelopment\StorePerformanceGoalRequest;
use App\Http\Requests\HumanCapital\PerformanceDevelopment\UpdatePerformanceGoalRequest;
use App\Http\Requests\HumanCapital\PerformanceDevelopment\StorePerformanceAppraisalRequest;
use App\Http\Requests\HumanCapital\PerformanceDevelopment\UpdatePerformanceAppraisalRequest;
use App\Http\Requests\HumanCapital\PerformanceDevelopment\StoreContinuousFeedbackRequest;
use App\Domains\HumanCapital\PerformanceDevelopment\Actions\ListPerformanceGoalsAction;
use App\Domains\HumanCapital\PerformanceDevelopment\Actions\CreatePerformanceGoalAction;
use App\Domains\HumanCapital\PerformanceDevelopment\Actions\UpdatePerformanceGoalAction;
use App\Domains\HumanCapital\PerformanceDevelopment\Actions\ListPerformanceAppraisalsAction;
use App\Domains\HumanCapital\PerformanceDevelopment\Actions\CreatePerformanceAppraisalAction;
use App\Domains\HumanCapital\PerformanceDevelopment\Actions\UpdatePerformanceAppraisalAction;
use App\Domains\HumanCapital\PerformanceDevelopment\Actions\ListContinuousFeedbackAction;
use App\Domains\HumanCapital\PerformanceDevelopment\Actions\CreateContinuousFeedbackAction;
use App\Domains\HumanCapital\PerformanceDevelopment\Models\PerformanceGoal;
use App\Domains\HumanCapital\PerformanceDevelopment\Models\PerformanceAppraisal;
use App\Domains\HumanCapital\PerformanceDevelopment\Models\ContinuousFeedback;
use App\Http\Resources\HumanCapital\PerformanceDevelopment\PerformanceGoalResource;
use App\Http\Resources\HumanCapital\PerformanceDevelopment\PerformanceAppraisalResource;
use App\Http\Resources\HumanCapital\PerformanceDevelopment\ContinuousFeedbackResource;
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

        return $this->paginatedResponse(
            PerformanceGoalResource::collection($goals['data'] ?? $goals),
            $goals['total'] ?? count($goals['data'] ?? $goals),
            $goals['current_page'] ?? 1,
            $goals['per_page'] ?? 15
        );
    }

    public function storeGoal(StorePerformanceGoalRequest $request, CreatePerformanceGoalAction $action)
    {
        $validated = $request->validated();
        $result = $action->execute($validated);
        $goal = PerformanceGoal::find($result['id'] ?? $result);
        return $this->successResponse(new PerformanceGoalResource($goal), 'Goal created successfully', 201);
    }

    public function updateGoal(UpdatePerformanceGoalRequest $request, $id, UpdatePerformanceGoalAction $action)
    {
        $validated = $request->validated();
        $result = $action->execute($id, $validated);
        $goal = PerformanceGoal::find($result['id'] ?? $id);
        return $this->successResponse(new PerformanceGoalResource($goal), 'Goal updated successfully');
    }

    // Appraisals
    public function indexAppraisals(Request $request, ListPerformanceAppraisalsAction $action)
    {
        $filters = $request->only(['employee_id', 'appraisal_type', 'status']);
        $appraisals = $action->execute($filters);

        return $this->paginatedResponse(
            PerformanceAppraisalResource::collection($appraisals['data'] ?? $appraisals),
            $appraisals['total'] ?? count($appraisals['data'] ?? $appraisals),
            $appraisals['current_page'] ?? 1,
            $appraisals['per_page'] ?? 15
        );
    }

    public function storeAppraisal(StorePerformanceAppraisalRequest $request, CreatePerformanceAppraisalAction $action)
    {
        $validated = $request->validated();
        $result = $action->execute($validated);
        $appraisal = PerformanceAppraisal::find($result['id'] ?? $result);
        return $this->successResponse(new PerformanceAppraisalResource($appraisal), 'Appraisal created successfully', 201);
    }

    public function updateAppraisal(UpdatePerformanceAppraisalRequest $request, $id, UpdatePerformanceAppraisalAction $action)
    {
        $validated = $request->validated();
        $result = $action->execute($id, $validated);
        $appraisal = PerformanceAppraisal::find($result['id'] ?? $id);
        return $this->successResponse(new PerformanceAppraisalResource($appraisal), 'Appraisal updated successfully');
    }

    // Continuous Feedback
    public function indexFeedback(Request $request, ListContinuousFeedbackAction $action)
    {
        $filters = $request->only(['employee_id', 'feedback_type']);
        $feedback = $action->execute($filters);

        return $this->paginatedResponse(
            ContinuousFeedbackResource::collection($feedback['data'] ?? $feedback),
            $feedback['total'] ?? count($feedback['data'] ?? $feedback),
            $feedback['current_page'] ?? 1,
            $feedback['per_page'] ?? 15
        );
    }

    public function storeFeedback(StoreContinuousFeedbackRequest $request, CreateContinuousFeedbackAction $action)
    {
        $validated = $request->validated();
        $result = $action->execute($validated);
        $feedbackModel = ContinuousFeedback::find($result['id'] ?? $result);
        return $this->successResponse(new ContinuousFeedbackResource($feedbackModel), 'Feedback recorded successfully', 201);
    }
}
