<?php

namespace App\Http\Controllers\Api\V2\Commercial\SalesLifecycle;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Domains\SupplyChain\Inventory\Actions\ListServicesAction;
use App\Domains\SupplyChain\Inventory\Actions\CreateServiceAction;
use App\Domains\SupplyChain\Inventory\Actions\UpdateServiceAction;
use App\Domains\SupplyChain\Inventory\Actions\DeleteServiceAction;
use App\Domains\SupplyChain\Inventory\Models\Product;
use App\Http\Requests\Commercial\SalesLifecycle\ListServicesRequest;
use App\Http\Requests\Commercial\SalesLifecycle\StoreServiceRequest;
use App\Http\Requests\Commercial\SalesLifecycle\UpdateServiceRequest;
use App\Http\Requests\Commercial\SalesLifecycle\DeleteServiceRequest;
use App\Http\Resources\Commercial\SalesLifecycle\ServiceResource;
use Illuminate\Http\JsonResponse;

/**
 * CRUD controller for the service catalogue.
 * Services are items where item_type = 'service'.
 * Mounted under /v2/services.
 */
class ServiceController extends Controller
{
    use BaseApiController;

    public function index(ListServicesRequest $request, ListServicesAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());

        return $this->paginatedResponse(
            ServiceResource::collection($result['data'])->resolve(),
            $result['total'],
            $result['page'],
            $result['per_page']
        );
    }

    public function store(StoreServiceRequest $request, CreateServiceAction $action): JsonResponse
    {
        try {
            $result  = $action->execute($request->validated());
            $service = Product::with(['category', 'serviceAvailability'])->findOrFail($result['id']);
            return $this->successResponse((new ServiceResource($service))->resolve(), 'Service created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function update(UpdateServiceRequest $request, UpdateServiceAction $action): JsonResponse
    {
        try {
            $result  = $action->execute($request->validated());
            $service = Product::with(['category', 'serviceAvailability'])->findOrFail($result['id']);
            return $this->successResponse((new ServiceResource($service))->resolve(), 'Service updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function destroy(DeleteServiceRequest $request, DeleteServiceAction $action): JsonResponse
    {
        try {
            $action->execute((int)$request->validated()['id']);
            return $this->successResponse([], 'Service deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
