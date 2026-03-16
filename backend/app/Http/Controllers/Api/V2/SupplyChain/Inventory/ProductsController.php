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
use App\Domains\SupplyChain\Inventory\Models\Product;

class ProductsController extends Controller
{
    use BaseApiController;

    public function index(ListProductsRequest $request, ListProductsAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        
        return $this->paginatedResponse(
            ProductResource::collection($result['data'])->resolve(),
            $result['total'],
            $result['page'],
            $result['per_page']
        );
    }

    public function store(StoreProductRequest $request, CreateProductAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated());
            $product = Product::findOrFail($result['id']);
            return $this->successResponse((new ProductResource($product))->resolve(), 'Product created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function update(UpdateProductRequest $request, UpdateProductAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated());
            $product = Product::findOrFail($result['id']);
            return $this->successResponse((new ProductResource($product))->resolve(), 'Product updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function destroy(DeleteProductRequest $request, DeleteProductAction $action): JsonResponse
    {
        $action->execute((int)$request->id);
        return $this->successResponse([], 'Product deleted successfully');
    }
}
