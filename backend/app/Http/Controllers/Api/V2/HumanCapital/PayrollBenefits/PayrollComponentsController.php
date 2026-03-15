<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\PayrollBenefits;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollComponent;
use App\Http\Requests\HumanCapital\PayrollBenefits\StorePayrollComponentRequest;
use App\Http\Requests\HumanCapital\PayrollBenefits\UpdatePayrollComponentRequest;
use App\Http\Requests\HumanCapital\PayrollBenefits\ListPayrollComponentsRequest;
use App\Domains\HumanCapital\PayrollBenefits\Actions\ListPayrollComponentsAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\CreatePayrollComponentAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\ShowPayrollComponentAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\UpdatePayrollComponentAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\DeletePayrollComponentAction;
use App\Http\Resources\HumanCapital\PayrollBenefits\PayrollComponentResource;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Http\JsonResponse;

class PayrollComponentsController extends Controller
{
    use BaseApiController;

    public function index(ListPayrollComponentsRequest $request, ListPayrollComponentsAction $action): JsonResponse
    {
        $components = $action->execute();
        $data = $components['data'] ?? $components;

        return $this->successResponse(PayrollComponentResource::collection($data));
    }

    public function store(StorePayrollComponentRequest $request, CreatePayrollComponentAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        $component = PayrollComponent::find($result['id'] ?? $result);
        return $this->successResponse(new PayrollComponentResource($component), 'Payroll component created', 201);
    }

    public function update(UpdatePayrollComponentRequest $request, $id, UpdatePayrollComponentAction $action): JsonResponse
    {
        $result = $action->execute((int)$id, $request->validated());
        $component = PayrollComponent::find($result['id'] ?? $id);
        return $this->successResponse(new PayrollComponentResource($component), 'Payroll component updated');
    }

    public function destroy($id, DeletePayrollComponentAction $action): JsonResponse
    {
        $action->execute((int)$id);
        return $this->successResponse([], 'Payroll component deleted');
    }

    public function show($id, ShowPayrollComponentAction $action): JsonResponse
    {
        $result = $action->execute((int)$id);
        $component = PayrollComponent::find($result['id'] ?? $id);
        return $this->successResponse(new PayrollComponentResource($component));
    }
}
