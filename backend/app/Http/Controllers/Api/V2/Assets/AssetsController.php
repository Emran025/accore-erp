<?php

namespace App\Http\Controllers\Api\V2\Assets;

use App\Http\Controllers\Controller;
use App\Http\Requests\Assets\ListAssetsRequest;
use App\Http\Requests\Assets\StoreAssetRequest;
use App\Http\Requests\Assets\UpdateAssetRequest;
use App\Http\Requests\Assets\DeleteAssetRequest;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Resources\Assets\AssetLifecycle\AssetResource;
use App\Domains\Assets\AssetLifecycle\Actions\ListAssetsAction;
use App\Domains\Assets\AssetLifecycle\Actions\CreateAssetAction;
use App\Domains\Assets\AssetLifecycle\Actions\UpdateAssetAction;
use App\Domains\Assets\AssetLifecycle\Actions\DeleteAssetAction;

class AssetsController extends Controller
{
    use BaseApiController;

    public function index(ListAssetsRequest $request, ListAssetsAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        return $this->paginatedResponse(
            AssetResource::collection($result['data']),
            $result['total'],
            $result['current_page'],
            $result['per_page']
        );
    }

    public function store(StoreAssetRequest $request, CreateAssetAction $action): JsonResponse
    {
        try {
            $asset = $action->execute($request->validated());
            return $this->successResponse((new AssetResource($asset))->resolve(), 'Asset created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function update(UpdateAssetRequest $request, UpdateAssetAction $action): JsonResponse
    {
        try {
            $asset = $action->execute($request->validated());
            return $this->successResponse((new AssetResource($asset))->resolve(), 'Asset updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function destroy(DeleteAssetRequest $request, DeleteAssetAction $action): JsonResponse
    {
        try {
            $action->execute($request->validated()['id']);
            return $this->successResponse([], 'Asset deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
