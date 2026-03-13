<?php

namespace App\Http\Controllers\Api\V2\SupplyChain\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\SupplyChain\Inventory\ListPeriodicInventoryRequest;
use App\Http\Requests\SupplyChain\Inventory\StorePeriodicInventoryRequest;
use App\Http\Requests\SupplyChain\Inventory\ProcessPeriodicInventoryRequest;
use App\Domains\SupplyChain\Inventory\Actions\ListPeriodicInventoryAction;
use App\Domains\SupplyChain\Inventory\Actions\CreatePeriodicInventoryAction;
use App\Domains\SupplyChain\Inventory\Actions\ProcessPeriodicInventoryAction;
use App\Domains\SupplyChain\Inventory\Actions\PeriodicInventoryValuationAction;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class PeriodicInventoryController extends Controller
{
    use BaseApiController;

    public function index(ListPeriodicInventoryRequest $request, ListPeriodicInventoryAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        return $this->paginatedResponse(
            $result['data'],
            $result['total'],
            $result['page'],
            $result['per_page']
        );
    }

    public function store(StorePeriodicInventoryRequest $request, CreatePeriodicInventoryAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        return $this->successResponse($result, 'Inventory count recorded successfully');
    }

    public function process(ProcessPeriodicInventoryRequest $request, ProcessPeriodicInventoryAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated());
            return $this->successResponse($result);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function valuation(PeriodicInventoryValuationAction $action): JsonResponse
    {
        $result = $action->execute();
        return $this->successResponse($result);
    }
}
