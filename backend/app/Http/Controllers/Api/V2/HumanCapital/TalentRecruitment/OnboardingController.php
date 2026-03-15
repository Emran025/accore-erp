<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\TalentRecruitment;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\TalentRecruitment\StoreOnboardingWorkflowRequest;
use App\Http\Requests\HumanCapital\TalentRecruitment\StoreOnboardingDocumentRequest;
use App\Http\Requests\HumanCapital\TalentRecruitment\UpdateOnboardingTaskRequest;
use App\Domains\HumanCapital\TalentRecruitment\Actions\ListOnboardingWorkflowsAction;
use App\Domains\HumanCapital\TalentRecruitment\Actions\CreateOnboardingWorkflowAction;
use App\Domains\HumanCapital\TalentRecruitment\Actions\ShowOnboardingWorkflowAction;
use App\Domains\HumanCapital\TalentRecruitment\Actions\UpdateOnboardingTaskAction;
use App\Domains\HumanCapital\TalentRecruitment\Actions\CreateOnboardingDocumentAction;
use App\Domains\HumanCapital\TalentRecruitment\Models\OnboardingWorkflow;
use App\Domains\HumanCapital\TalentRecruitment\Models\OnboardingTask;
use App\Domains\HumanCapital\HRAdvanced\Models\OnboardingDocument;
use App\Http\Resources\HumanCapital\TalentRecruitment\OnboardingWorkflowResource;
use App\Http\Resources\HumanCapital\TalentRecruitment\OnboardingTaskResource;
use App\Http\Resources\HumanCapital\TalentRecruitment\OnboardingDocumentResource;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class OnboardingController extends Controller
{
    use BaseApiController;

    public function index(Request $request, ListOnboardingWorkflowsAction $action)
    {
        $filters = $request->only(['employee_id', 'workflow_type', 'status']);
        $workflows = $action->execute($filters);

        return $this->paginatedResponse(
            OnboardingWorkflowResource::collection($workflows['data'] ?? $workflows),
            $workflows['total'] ?? count($workflows['data'] ?? $workflows),
            $workflows['current_page'] ?? 1,
            $workflows['per_page'] ?? 15
        );
    }

    public function store(StoreOnboardingWorkflowRequest $request, CreateOnboardingWorkflowAction $action)
    {
        $validated = $request->validated();
        $result = $action->execute($validated);
        $workflow = OnboardingWorkflow::find($result['id'] ?? $result);
        return $this->successResponse(new OnboardingWorkflowResource($workflow), 'Onboarding workflow created successfully', 201);
    }

    public function show($id, ShowOnboardingWorkflowAction $action)
    {
        $result = $action->execute($id);
        $workflow = OnboardingWorkflow::find($result['id'] ?? $id);
        return $this->successResponse(new OnboardingWorkflowResource($workflow));
    }

    public function updateTask(UpdateOnboardingTaskRequest $request, $workflowId, $taskId, UpdateOnboardingTaskAction $action)
    {
        $validated = $request->validated();
        $result = $action->execute($workflowId, $taskId, $validated);
        $task = OnboardingTask::find($result['id'] ?? $taskId);
        return $this->successResponse(new OnboardingTaskResource($task), 'Task updated successfully');
    }

    public function storeDocument(StoreOnboardingDocumentRequest $request, $workflowId, CreateOnboardingDocumentAction $action)
    {
        $validated = $request->validated();
        $result = $action->execute($workflowId, $validated);
        $document = OnboardingDocument::find($result['id'] ?? $result);
        return $this->successResponse(new OnboardingDocumentResource($document), 'Document uploaded successfully', 201);
    }
}
