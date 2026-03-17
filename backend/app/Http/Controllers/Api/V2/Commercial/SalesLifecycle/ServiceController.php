<?php

namespace App\Http\Controllers\Api\V2\Commercial\SalesLifecycle;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Domains\SupplyChain\Inventory\Actions\ListServicesAction;
use App\Domains\SupplyChain\Inventory\Actions\CreateServiceAction;
use App\Domains\SupplyChain\Inventory\Actions\UpdateServiceAction;
use App\Domains\SupplyChain\Inventory\Actions\DeleteServiceAction;
use App\Domains\SupplyChain\Inventory\Models\Product;
use App\Http\Resources\Commercial\SalesLifecycle\ServiceResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * CRUD controller for the service catalogue.
 * Services are items where item_type = 'service'.
 * Mounted under /v2/services.
 */
class ServiceController extends Controller
{
    use BaseApiController;

    public function index(Request $request, ListServicesAction $action): JsonResponse
    {
        $result = $action->execute($request->only(['search', 'page', 'per_page']));

        return $this->paginatedResponse(
            ServiceResource::collection($result['data'])->resolve(),
            $result['total'],
            $result['page'],
            $result['per_page']
        );
    }

    public function store(Request $request, CreateServiceAction $action): JsonResponse
    {
        $data = $request->validate([
            'name'                   => 'required|string|max:255',
            'description'            => 'nullable|string',
            'category_id'            => 'nullable|integer|exists:categories,id',
            'unit_price'             => 'required|numeric|min:0',
            'minimum_profit_margin'  => 'nullable|numeric|min:0',
            'taxable'                => 'boolean',
            'unit_name'              => 'nullable|string|max:50',
            'sub_unit_name'          => 'nullable|string|max:50',
            'pos_locations'          => 'nullable|array',
            'pos_locations.*.pos_location'   => 'required|string|max:100',
            'pos_locations.*.active'         => 'boolean',
            'pos_locations.*.effective_from' => 'nullable|date',
            'pos_locations.*.effective_to'   => 'nullable|date',
            'pos_locations.*.notes'          => 'nullable|string',
        ]);

        try {
            $result  = $action->execute($data);
            $service = Product::with(['category', 'serviceAvailability'])->findOrFail($result['id']);
            return $this->successResponse((new ServiceResource($service))->resolve(), 'Service created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function update(Request $request, UpdateServiceAction $action): JsonResponse
    {
        $data = $request->validate([
            'id'                     => 'required|integer',
            'name'                   => 'sometimes|string|max:255',
            'description'            => 'nullable|string',
            'category_id'            => 'nullable|integer|exists:categories,id',
            'unit_price'             => 'sometimes|numeric|min:0',
            'minimum_profit_margin'  => 'nullable|numeric|min:0',
            'taxable'                => 'boolean',
            'unit_name'              => 'nullable|string|max:50',
            'sub_unit_name'          => 'nullable|string|max:50',
            'pos_locations'          => 'nullable|array',
            'pos_locations.*.pos_location'   => 'required|string|max:100',
            'pos_locations.*.active'         => 'boolean',
            'pos_locations.*.effective_from' => 'nullable|date',
            'pos_locations.*.effective_to'   => 'nullable|date',
            'pos_locations.*.notes'          => 'nullable|string',
        ]);

        try {
            $result  = $action->execute($data);
            $service = Product::with(['category', 'serviceAvailability'])->findOrFail($result['id']);
            return $this->successResponse((new ServiceResource($service))->resolve(), 'Service updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function destroy(Request $request, DeleteServiceAction $action): JsonResponse
    {
        $id = (int)$request->input('id');
        if (!$id) {
            return $this->errorResponse('ID is required', 400);
        }

        try {
            $action->execute($id);
            return $this->successResponse([], 'Service deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
