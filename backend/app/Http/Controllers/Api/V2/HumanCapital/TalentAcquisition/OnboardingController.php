<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\TalentAcquisition;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\TalentAcquisition\StoreOnboardingWorkflowRequest;
use App\Http\Requests\HumanCapital\TalentAcquisition\StoreOnboardingDocumentRequest;
use App\Http\Requests\HumanCapital\TalentAcquisition\UpdateOnboardingTaskRequest;
use App\Domains\HumanCapital\TalentAcquisition\Actions\ListOnboardingWorkflowsAction;
use App\Domains\HumanCapital\TalentAcquisition\Actions\CreateOnboardingWorkflowAction;
use App\Domains\HumanCapital\TalentAcquisition\Actions\ShowOnboardingWorkflowAction;
use App\Domains\HumanCapital\TalentAcquisition\Actions\UpdateOnboardingTaskAction;
use App\Domains\HumanCapital\TalentAcquisition\Actions\CreateOnboardingDocumentAction;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class OnboardingController extends Controller
{
    use BaseApiController;

    public function index(Request $request, ListOnboardingWorkflowsAction $action)
    {
        $filters = $request->only(['employee_id', 'workflow_type', 'status']);
        $workflows = $action->execute($filters);

        return $this->successResponse($workflows);
    }

    public function store(StoreOnboardingWorkflowRequest $request, CreateOnboardingWorkflowAction $action)
    {
        $validated = $request->validated();
        $workflow = $action->execute($validated);

        return response()->json(array_merge(['success' => true], $workflow), 201);
    }

    public function show($id, ShowOnboardingWorkflowAction $action)
    {
        $workflow = $action->execute($id);
        return $this->successResponse($workflow);
    }

    public function updateTask(UpdateOnboardingTaskRequest $request, $workflowId, $taskId, UpdateOnboardingTaskAction $action)
    {
        $validated = $request->validated();
        $task = $action->execute($workflowId, $taskId, $validated);

        return $this->successResponse($task);
    }

    public function storeDocument(StoreOnboardingDocumentRequest $request, $workflowId, CreateOnboardingDocumentAction $action)
    {
        $validated = $request->validated();
        $document = $action->execute($workflowId, $validated);

        return response()->json(array_merge(['success' => true], $document), 201);
    }
}
