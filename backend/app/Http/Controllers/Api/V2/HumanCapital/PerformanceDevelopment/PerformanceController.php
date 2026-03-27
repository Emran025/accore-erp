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
            PerformanceGoalResource::collection($goals),
            $goals->total(),
            $goals->currentPage(),
            $goals->perPage()
        );
    }

    public function storeGoal(StorePerformanceGoalRequest $request, CreatePerformanceGoalAction $action)
    {
        $validated = $request->validated();
        $goal = $action->execute($validated);
        return $this->successResponse(new PerformanceGoalResource($goal), 'Goal created successfully', 201);
    }

    public function updateGoal(UpdatePerformanceGoalRequest $request, $id, UpdatePerformanceGoalAction $action)
    {
        $validated = $request->validated();
        $goal = $action->execute($id, $validated);
        return $this->successResponse(new PerformanceGoalResource($goal), 'Goal updated successfully');
    }

    // Appraisals
    public function indexAppraisals(Request $request, ListPerformanceAppraisalsAction $action)
    {
        $filters = $request->only(['employee_id', 'appraisal_type', 'status']);
        $appraisals = $action->execute($filters);

        return $this->paginatedResponse(
            PerformanceAppraisalResource::collection($appraisals),
            $appraisals->total(),
            $appraisals->currentPage(),
            $appraisals->perPage()
        );
    }

    public function storeAppraisal(StorePerformanceAppraisalRequest $request, CreatePerformanceAppraisalAction $action)
    {
        $validated = $request->validated();
        $appraisal = $action->execute($validated);
        return $this->successResponse(new PerformanceAppraisalResource($appraisal), 'Appraisal created successfully', 201);
    }

    public function updateAppraisal(UpdatePerformanceAppraisalRequest $request, $id, UpdatePerformanceAppraisalAction $action)
    {
        $validated = $request->validated();
        $appraisal = $action->execute($id, $validated);
        return $this->successResponse(new PerformanceAppraisalResource($appraisal), 'Appraisal updated successfully');
    }

    // Continuous Feedback
    public function indexFeedback(Request $request, ListContinuousFeedbackAction $action)
    {
        $filters = $request->only(['employee_id', 'feedback_type']);
        $feedback = $action->execute($filters);

        return $this->paginatedResponse(
            ContinuousFeedbackResource::collection($feedback),
            $feedback->total(),
            $feedback->currentPage(),
            $feedback->perPage()
        );
    }

    public function storeFeedback(StoreContinuousFeedbackRequest $request, CreateContinuousFeedbackAction $action)
    {
        $validated = $request->validated();
        $feedbackModel = $action->execute($validated);
        return $this->successResponse(new ContinuousFeedbackResource($feedbackModel), 'Feedback recorded successfully', 201);
    }
}
