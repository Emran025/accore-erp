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
        $paginator = $action->execute($request->all());
        return $this->successResponse(OnboardingWorkflowResource::collection($paginator));
    }

    public function store(StoreOnboardingWorkflowRequest $request, CreateOnboardingWorkflowAction $action)
    {
        try {
            $workflow = $action->execute($request->validated());
            return $this->successResponse(new OnboardingWorkflowResource($workflow), 'Onboarding workflow created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function show($id, ShowOnboardingWorkflowAction $action)
    {
        $workflow = $action->execute($id);
        return $this->successResponse(new OnboardingWorkflowResource($workflow));
    }

    public function updateTask(UpdateOnboardingTaskRequest $request, $workflowId, $taskId, UpdateOnboardingTaskAction $action)
    {
        try {
            $task = $action->execute($workflowId, $taskId, $request->validated());
            return $this->successResponse(new OnboardingTaskResource($task), 'Task updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function storeDocument(StoreOnboardingDocumentRequest $request, $workflowId, CreateOnboardingDocumentAction $action)
    {
        try {
            $document = $action->execute($workflowId, $request->validated());
            return $this->successResponse(new OnboardingDocumentResource($document), 'Document uploaded successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
