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
        $data = $workflows['data'] ?? $workflows;

        return $this->paginatedResponse(
            OnboardingWorkflowResource::collection($data)->resolve(),
            $workflows['total'] ?? (is_countable($data) ? count($data) : 0),
            $workflows['current_page'] ?? 1,
            $workflows['per_page'] ?? 15
        );
    }

    public function store(StoreOnboardingWorkflowRequest $request, CreateOnboardingWorkflowAction $action)
    {
        try {
            $validated = $request->validated();
            $result = $action->execute($validated);
            $workflow = OnboardingWorkflow::findOrFail($result['id'] ?? $result);
            return $this->successResponse((new OnboardingWorkflowResource($workflow))->resolve(), 'Onboarding workflow created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function show($id, ShowOnboardingWorkflowAction $action)
    {
        $result = $action->execute($id);
        $workflow = OnboardingWorkflow::findOrFail($result['id'] ?? $id);
        return $this->successResponse((new OnboardingWorkflowResource($workflow))->resolve());
    }

    public function updateTask(UpdateOnboardingTaskRequest $request, $workflowId, $taskId, UpdateOnboardingTaskAction $action)
    {
        try {
            $validated = $request->validated();
            $result = $action->execute($workflowId, $taskId, $validated);
            $task = OnboardingTask::findOrFail($result['id'] ?? $taskId);
            return $this->successResponse((new OnboardingTaskResource($task))->resolve(), 'Task updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function storeDocument(StoreOnboardingDocumentRequest $request, $workflowId, CreateOnboardingDocumentAction $action)
    {
        try {
            $validated = $request->validated();
            $result = $action->execute($workflowId, $validated);
            $document = OnboardingDocument::findOrFail($result['id'] ?? $result);
            return $this->successResponse((new OnboardingDocumentResource($document))->resolve(), 'Document uploaded successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
