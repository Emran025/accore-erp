<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\Payroll;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\Payroll\Models\PayrollComponent;
use App\Http\Requests\HumanCapital\Payroll\StorePayrollComponentRequest;
use App\Http\Requests\HumanCapital\Payroll\UpdatePayrollComponentRequest;
use App\Http\Requests\HumanCapital\Payroll\ListPayrollComponentsRequest;
use App\Domains\HumanCapital\Payroll\Actions\ListPayrollComponentsAction;
use App\Domains\HumanCapital\Payroll\Actions\CreatePayrollComponentAction;
use App\Domains\HumanCapital\Payroll\Actions\ShowPayrollComponentAction;
use App\Domains\HumanCapital\Payroll\Actions\UpdatePayrollComponentAction;
use App\Domains\HumanCapital\Payroll\Actions\DeletePayrollComponentAction;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Http\JsonResponse;

class PayrollComponentsController extends Controller
{
    use BaseApiController;

    public function index(ListPayrollComponentsRequest $request, ListPayrollComponentsAction $action): JsonResponse
    {
        $components = $action->execute();
        return $this->successResponse($components);
    }

    public function store(StorePayrollComponentRequest $request, CreatePayrollComponentAction $action): JsonResponse
    {
        $component = $action->execute($request->validated());
        return $this->successResponse($component, 'Payroll component created');
    }

    public function update(UpdatePayrollComponentRequest $request, $id, UpdatePayrollComponentAction $action): JsonResponse
    {
        $component = $action->execute((int)$id, $request->validated());
        return $this->successResponse($component, 'Payroll component updated');
    }

    public function destroy($id, DeletePayrollComponentAction $action): JsonResponse
    {
        $action->execute((int)$id);
        return $this->successResponse([], 'Payroll component deleted');
    }

    public function show($id, ShowPayrollComponentAction $action): JsonResponse
    {
        $component = $action->execute((int)$id);
        return $this->successResponse($component);
    }
}
