<?php

namespace App\Http\Controllers\Api\V2\SupplyChain\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\SupplyChain\Inventory\StoreCategoryRequest;
use App\Http\Requests\SupplyChain\Inventory\UpdateCategoryRequest;
use App\Http\Requests\SupplyChain\Inventory\DeleteCategoryRequest;
use App\Domains\SupplyChain\Inventory\Actions\ListCategoriesAction;
use App\Domains\SupplyChain\Inventory\Actions\CreateCategoryAction;
use App\Domains\SupplyChain\Inventory\Actions\UpdateCategoryAction;
use App\Domains\SupplyChain\Inventory\Actions\DeleteCategoryAction;
use App\Http\Resources\SupplyChain\Inventory\CategoryResource;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class CategoriesController extends Controller
{
    use BaseApiController;

    public function index(ListCategoriesAction $action): JsonResponse
    {
        $categories = $action->execute();
        return $this->successResponse(CategoryResource::collection($categories));
    }

    public function store(StoreCategoryRequest $request, CreateCategoryAction $action): JsonResponse
    {
        try {
            $category = $action->execute($request->validated());
            return $this->successResponse(new CategoryResource($category), 'Category created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function update(UpdateCategoryRequest $request, int $id, UpdateCategoryAction $action): JsonResponse
    {
        try {
            $category = $action->execute($request->validated(), $id);
            return $this->successResponse(new CategoryResource($category), 'Category updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function destroy(DeleteCategoryRequest $request, int $id, DeleteCategoryAction $action): JsonResponse
    {
        try {
            $action->execute($id);
            return $this->successResponse([], 'Category deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
