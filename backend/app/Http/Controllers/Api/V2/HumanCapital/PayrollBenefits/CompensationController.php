<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\PayrollBenefits;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\PayrollBenefits\StoreCompensationPlanRequest;
use App\Http\Requests\HumanCapital\PayrollBenefits\UpdateCompensationPlanRequest;
use App\Http\Requests\HumanCapital\PayrollBenefits\StoreCompensationEntryRequest;
use App\Http\Requests\HumanCapital\PayrollBenefits\UpdateCompensationEntryStatusRequest;
use App\Domains\HumanCapital\PayrollBenefits\Actions\ListCompensationPlansAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\CreateCompensationPlanAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\ShowCompensationPlanAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\UpdateCompensationPlanAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\ListCompensationEntriesAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\CreateCompensationEntryAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\UpdateCompensationEntryStatusAction;
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
