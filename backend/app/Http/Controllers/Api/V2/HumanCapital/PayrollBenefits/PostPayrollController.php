<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\PayrollBenefits;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\PayrollBenefits\Actions\CreatePostPayrollIntegrationAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\ListPostPayrollIntegrationsAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\ProcessPostPayrollIntegrationAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\ReconcilePostPayrollIntegrationAction;
use App\Http\Requests\HumanCapital\PayrollBenefits\StorePostPayrollIntegrationRequest;
use App\Http\Requests\HumanCapital\PayrollBenefits\ReconcilePostPayrollIntegrationRequest;
use App\Http\Resources\HumanCapital\PayrollBenefits\PostPayrollIntegrationResource;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Http\JsonResponse;

class PostPayrollController extends Controller
{
    use BaseApiController;

    public function index(Request $request, ListPostPayrollIntegrationsAction $action): JsonResponse
    {
        $filters = $request->only(['payroll_cycle_id', 'integration_type', 'status']);
        $paginator = $action->execute($filters);
        
        return $this->successResponse(PostPayrollIntegrationResource::collection($paginator));
    }

    public function store(StorePostPayrollIntegrationRequest $request, CreatePostPayrollIntegrationAction $action): JsonResponse
    {
        $integration = $action->execute($request->validated());
        return $this->successResponse(new PostPayrollIntegrationResource($integration), 'Integration created successfully', 201);
    }

    public function process(Request $request, $id, ProcessPostPayrollIntegrationAction $action): JsonResponse
    {
        try {
            $integration = $action->execute($id);
            return $this->successResponse(new PostPayrollIntegrationResource($integration), 'Integration processed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function reconcile(ReconcilePostPayrollIntegrationRequest $request, $id, ReconcilePostPayrollIntegrationAction $action): JsonResponse
    {
        $integration = $action->execute($id, $request->validated());
        return $this->successResponse(new PostPayrollIntegrationResource($integration), 'Integration reconciled successfully');
    }
}
