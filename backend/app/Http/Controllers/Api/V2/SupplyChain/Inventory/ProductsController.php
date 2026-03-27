<?php

namespace App\Http\Controllers\Api\V2\SupplyChain\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\SupplyChain\Inventory\ListProductsRequest;
use App\Http\Requests\SupplyChain\Inventory\StoreProductRequest;
use App\Http\Requests\SupplyChain\Inventory\UpdateProductRequest;
use App\Http\Requests\SupplyChain\Inventory\DeleteProductRequest;
use App\Domains\SupplyChain\Inventory\Actions\ListProductsAction;
use App\Domains\SupplyChain\Inventory\Actions\CreateProductAction;
use App\Domains\SupplyChain\Inventory\Actions\UpdateProductAction;
use App\Domains\SupplyChain\Inventory\Actions\DeleteProductAction;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Resources\SupplyChain\Inventory\ProductResource;

class ProductsController extends Controller
{
    use BaseApiController;

    public function index(ListProductsRequest $request, ListProductsAction $action): JsonResponse
    {
        $paginator = $action->execute($request->validated());

        return $this->successResponse(ProductResource::collection($paginator));
    }

    public function store(StoreProductRequest $request, CreateProductAction $action): JsonResponse
    {
        try {
            $product = $action->execute($request->validated());
            return $this->successResponse(new ProductResource($product), 'Product created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function update(UpdateProductRequest $request, int $id, UpdateProductAction $action): JsonResponse
    {
        try {
            $product = $action->execute($request->validated(), $id);
            return $this->successResponse(new ProductResource($product), 'Product updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function destroy(DeleteProductRequest $request, int $id, DeleteProductAction $action): JsonResponse
    {
        try {
            $action->execute($id);
            return $this->successResponse([], 'Product deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
