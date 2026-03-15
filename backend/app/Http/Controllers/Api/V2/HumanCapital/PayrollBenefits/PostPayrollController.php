<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\PayrollBenefits;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\PayrollBenefits\Actions\CreatePostPayrollIntegrationAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\ListPostPayrollIntegrationsAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\ProcessPostPayrollIntegrationAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\ReconcilePostPayrollIntegrationAction;
use App\Http\Requests\HumanCapital\PayrollBenefits\StorePostPayrollIntegrationRequest;
use App\Http\Requests\HumanCapital\PayrollBenefits\ReconcilePostPayrollIntegrationRequest;
use App\Domains\HumanCapital\PayrollBenefits\Models\PostPayrollIntegration;
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
        $result = $action->execute($filters);
        
        $data = $result['data'] ?? $result;
        return $this->successResponse(PostPayrollIntegrationResource::collection($data));
    }

    public function store(StorePostPayrollIntegrationRequest $request, CreatePostPayrollIntegrationAction $action): JsonResponse
    {
        $validated = $request->validated();
        
        $result = $action->execute($validated);
        $integration = PostPayrollIntegration::find($result['id'] ?? $result);
        
        return $this->successResponse(new PostPayrollIntegrationResource($integration), 'Integration created successfully', 201);
    }

    public function process(Request $request, $id, ProcessPostPayrollIntegrationAction $action): JsonResponse
    {
        try {
            $result = $action->execute($id);
            $integration = PostPayrollIntegration::find($id);
            return $this->successResponse(new PostPayrollIntegrationResource($integration), 'Integration processed successfully');
        } catch (\Exception $e) {
            $statusCode = 500;
            if ($e->getMessage() === 'Integration already processed') {
                $statusCode = 400;
            }
            return $this->errorResponse($e->getMessage(), $statusCode);
        }
    }

    public function reconcile(ReconcilePostPayrollIntegrationRequest $request, $id, ReconcilePostPayrollIntegrationAction $action): JsonResponse
    {
        $validated = $request->validated();

        $result = $action->execute($id, $validated);
        $integration = PostPayrollIntegration::find($id);

        return $this->successResponse(new PostPayrollIntegrationResource($integration), 'Integration reconciled successfully');
    }
}
