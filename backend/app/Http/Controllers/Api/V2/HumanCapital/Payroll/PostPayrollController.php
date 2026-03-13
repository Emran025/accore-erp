<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\Payroll;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\Payroll\Actions\CreatePostPayrollIntegrationAction;
use App\Domains\HumanCapital\Payroll\Actions\ListPostPayrollIntegrationsAction;
use App\Domains\HumanCapital\Payroll\Actions\ProcessPostPayrollIntegrationAction;
use App\Domains\HumanCapital\Payroll\Actions\ReconcilePostPayrollIntegrationAction;
use App\Http\Requests\HumanCapital\Payroll\StorePostPayrollIntegrationRequest;
use App\Http\Requests\HumanCapital\Payroll\ReconcilePostPayrollIntegrationRequest;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class PostPayrollController extends Controller
{
    use BaseApiController;

    public function index(Request $request, ListPostPayrollIntegrationsAction $action)
    {
        $filters = $request->only(['payroll_cycle_id', 'integration_type', 'status']);
        $result = $action->execute($filters);
        
        return $this->successResponse($result);
    }

    public function store(StorePostPayrollIntegrationRequest $request, CreatePostPayrollIntegrationAction $action)
    {
        $validated = $request->validated();
        
        $result = $action->execute($validated);
        
        return response()->json(array_merge(['success' => true], $result), 201);
    }

    public function process(Request $request, $id, ProcessPostPayrollIntegrationAction $action)
    {
        try {
            $result = $action->execute($id);
            return $this->successResponse($result);
        } catch (\Exception $e) {
            $statusCode = 500;
            if ($e->getMessage() === 'Integration already processed') {
                $statusCode = 400;
            }
            return $this->errorResponse($e->getMessage(), $statusCode);
        }
    }

    public function reconcile(ReconcilePostPayrollIntegrationRequest $request, $id, ReconcilePostPayrollIntegrationAction $action)
    {
        $validated = $request->validated();

        $result = $action->execute($id, $validated);

        return $this->successResponse($result);
    }
}
