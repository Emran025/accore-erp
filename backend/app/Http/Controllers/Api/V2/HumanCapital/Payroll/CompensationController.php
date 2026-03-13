<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\Payroll;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\Payroll\StoreCompensationPlanRequest;
use App\Http\Requests\HumanCapital\Payroll\UpdateCompensationPlanRequest;
use App\Http\Requests\HumanCapital\Payroll\StoreCompensationEntryRequest;
use App\Http\Requests\HumanCapital\Payroll\UpdateCompensationEntryStatusRequest;
use App\Domains\HumanCapital\Payroll\Actions\ListCompensationPlansAction;
use App\Domains\HumanCapital\Payroll\Actions\CreateCompensationPlanAction;
use App\Domains\HumanCapital\Payroll\Actions\ShowCompensationPlanAction;
use App\Domains\HumanCapital\Payroll\Actions\UpdateCompensationPlanAction;
use App\Domains\HumanCapital\Payroll\Actions\ListCompensationEntriesAction;
use App\Domains\HumanCapital\Payroll\Actions\CreateCompensationEntryAction;
use App\Domains\HumanCapital\Payroll\Actions\UpdateCompensationEntryStatusAction;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class CompensationController extends Controller
{
    use BaseApiController;

    public function indexPlans(Request $request, ListCompensationPlansAction $action)
    {
        $filters = $request->only(['plan_type', 'status', 'fiscal_year']);
        $paginated = $action->execute($filters);

        return $this->paginatedResponse(
            $paginated['data'],
            $paginated['total'],
            $paginated['current_page'],
            $paginated['per_page']
        );
    }

    public function storePlan(StoreCompensationPlanRequest $request, CreateCompensationPlanAction $action)
    {
        $validated = $request->validated();
        $plan = $action->execute($validated);

        return response()->json(array_merge(['success' => true], $plan), 201);
    }

    public function showPlan($id, ShowCompensationPlanAction $action)
    {
        $plan = $action->execute($id);
        return $this->successResponse($plan);
    }

    public function updatePlan(UpdateCompensationPlanRequest $request, $id, UpdateCompensationPlanAction $action)
    {
        $validated = $request->validated();
        $plan = $action->execute($id, $validated);

        return $this->successResponse($plan);
    }

    public function indexEntries(Request $request, ListCompensationEntriesAction $action)
    {
        $filters = $request->only(['compensation_plan_id', 'employee_id', 'status']);
        $paginated = $action->execute($filters);

        return $this->paginatedResponse(
            $paginated['data'],
            $paginated['total'],
            $paginated['current_page'],
            $paginated['per_page']
        );
    }

    public function storeEntry(StoreCompensationEntryRequest $request, CreateCompensationEntryAction $action)
    {
        $validated = $request->validated();
        $entry = $action->execute($validated);

        return response()->json(array_merge(['success' => true], $entry), 201);
    }

    public function updateEntryStatus(UpdateCompensationEntryStatusRequest $request, $id, UpdateCompensationEntryStatusAction $action)
    {
        $validated = $request->validated();
        $entry = $action->execute($id, $validated);
        
        return $this->successResponse($entry);
    }
}
