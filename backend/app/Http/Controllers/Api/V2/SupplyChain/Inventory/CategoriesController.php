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
use App\Domains\SupplyChain\Inventory\Models\Category;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class CategoriesController extends Controller
{
    use BaseApiController;

    public function index(ListCategoriesAction $action): JsonResponse
    {
        $result = $action->execute();
        return $this->successResponse(CategoryResource::collection($result)->resolve());
    }

    public function store(StoreCategoryRequest $request, CreateCategoryAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated());
            $category = Category::findOrFail($result['id']);
            return $this->successResponse((new CategoryResource($category))->resolve(), 'Category created successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function update(UpdateCategoryRequest $request, UpdateCategoryAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated());
            $category = Category::findOrFail($result['id'] ?? $request->input('id'));
            return $this->successResponse((new CategoryResource($category))->resolve(), 'Category updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function destroy(DeleteCategoryRequest $request, DeleteCategoryAction $action): JsonResponse
    {
        $action->execute((int)$request->input('id'));
        return $this->successResponse([], 'Category deleted successfully');
    }
}
