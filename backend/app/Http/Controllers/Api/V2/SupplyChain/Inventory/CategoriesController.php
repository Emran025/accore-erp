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
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class CategoriesController extends Controller
{
    use BaseApiController;

    public function index(ListCategoriesAction $action): JsonResponse
    {
        $result = $action->execute();
        return $this->successResponse($result);
    }

    public function store(StoreCategoryRequest $request, CreateCategoryAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        return $this->successResponse($result, 'Category created successfully');
    }

    public function update(UpdateCategoryRequest $request, UpdateCategoryAction $action): JsonResponse
    {
        $action->execute($request->validated());
        return $this->successResponse([], 'Category updated successfully');
    }

    public function destroy(DeleteCategoryRequest $request, DeleteCategoryAction $action): JsonResponse
    {
        $action->execute((int)$request->input('id'));
        return $this->successResponse([], 'Category deleted successfully');
    }
}
