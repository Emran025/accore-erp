<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\ServicesWellness;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Domains\HumanCapital\ServicesWellness\Actions\ListTravelRequestsAction;
use App\Domains\HumanCapital\ServicesWellness\Actions\CreateTravelRequestAction;
use App\Domains\HumanCapital\ServicesWellness\Actions\UpdateTravelRequestStatusAction;
use App\Domains\HumanCapital\ServicesWellness\Actions\ListTravelExpensesAction;
use App\Domains\HumanCapital\ServicesWellness\Actions\CreateTravelExpenseAction;
use App\Domains\HumanCapital\ServicesWellness\Actions\UpdateTravelExpenseStatusAction;
use Illuminate\Http\JsonResponse;

class TravelExpenseController extends Controller
{
    use BaseApiController;

    public function indexRequests(ListTravelRequestsAction $action): JsonResponse
    {
        return $action->execute();
    }

    public function storeRequest(CreateTravelRequestAction $action): JsonResponse
    {
        return $action->execute();
    }

    public function updateRequestStatus($id, UpdateTravelRequestStatusAction $action): JsonResponse
    {
        return $action->execute((int)$id);
    }

    public function indexExpenses(ListTravelExpensesAction $action): JsonResponse
    {
        return $action->execute();
    }

    public function storeExpense(CreateTravelExpenseAction $action): JsonResponse
    {
        return $action->execute();
    }

    public function updateExpenseStatus($id, UpdateTravelExpenseStatusAction $action): JsonResponse
    {
        return $action->execute((int)$id);
    }
}


