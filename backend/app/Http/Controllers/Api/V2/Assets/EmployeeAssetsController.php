<?php

namespace App\Http\Controllers\Api\V2\Assets;

use App\Http\Controllers\Controller;
use App\Domains\Assets\AssetLifecycle\Models\EmployeeAsset;
use App\Http\Resources\Assets\AssetLifecycle\EmployeeAssetResource;
use App\Http\Requests\Assets\AssetLifecycle\{
    StoreEmployeeAssetRequest,
    UpdateEmployeeAssetRequest,
    ListEmployeeAssetsRequest
};
use App\Domains\Assets\AssetLifecycle\Actions\{
    ListEmployeeAssetsAction,
    CreateEmployeeAssetAction,
    ShowEmployeeAssetAction,
    UpdateEmployeeAssetAction,
    DeleteEmployeeAssetAction
};
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Http\JsonResponse;

class EmployeeAssetsController extends Controller
{
    use BaseApiController;

    public function index(ListEmployeeAssetsRequest $request, ListEmployeeAssetsAction $action): JsonResponse
    {
        $paginated = $action->execute($request->validated());

        return $this->paginatedResponse(
            EmployeeAssetResource::collection($paginated->items()),
            $paginated->total(),
            $paginated->currentPage(),
            $paginated->perPage()
        );
    }

    public function store(StoreEmployeeAssetRequest $request, CreateEmployeeAssetAction $action): JsonResponse
    {
        $asset = $action->execute($request->validated());
        
        return $this->successResponse(
            new EmployeeAssetResource($asset->load('employee')), 
            'Asset recorded successfully', 
            201
        );
    }

    public function show($id, ShowEmployeeAssetAction $action): JsonResponse
    {
        $asset = $action->execute($id);
        return $this->successResponse(new EmployeeAssetResource($asset));
    }

    public function update(UpdateEmployeeAssetRequest $request, $id, UpdateEmployeeAssetAction $action): JsonResponse
    {
        $asset = EmployeeAsset::findOrFail($id);
        $updatedAsset = $action->execute($asset, $request->validated());

        return $this->successResponse(
            new EmployeeAssetResource($updatedAsset->load('employee', 'costCenter')),
            'Asset updated successfully'
        );
    }

    public function destroy($id, DeleteEmployeeAssetAction $action): JsonResponse
    {
        $asset = EmployeeAsset::findOrFail($id);
        $action->execute($asset);
        
        return $this->successResponse([], 'Asset deleted successfully');
    }
}