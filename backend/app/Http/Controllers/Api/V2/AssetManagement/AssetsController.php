<?php

namespace App\Http\Controllers\Api\V2\AssetManagement;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssetManagement\ListAssetsRequest;
use App\Http\Requests\AssetManagement\StoreAssetRequest;
use App\Http\Requests\AssetManagement\UpdateAssetRequest;
use App\Http\Requests\AssetManagement\DeleteAssetRequest;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Domains\AssetManagement\Actions\ListAssetsAction;
use App\Domains\AssetManagement\Actions\CreateAssetAction;
use App\Domains\AssetManagement\Actions\UpdateAssetAction;
use App\Domains\AssetManagement\Actions\DeleteAssetAction;

class AssetsController extends Controller
{
    use BaseApiController;

    public function index(ListAssetsRequest $request, ListAssetsAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        return $this->paginatedResponse(
            $result['data'],
            $result['total'],
            $result['current_page'],
            $result['per_page']
        );
    }

    public function store(StoreAssetRequest $request, CreateAssetAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        return $this->successResponse(['id' => $result['id']]);
    }

    public function update(UpdateAssetRequest $request, UpdateAssetAction $action): JsonResponse
    {
        $action->execute($request->validated());
        return $this->successResponse();
    }

    public function destroy(DeleteAssetRequest $request, DeleteAssetAction $action): JsonResponse
    {
        $action->execute($request->validated()['id']);
        return $this->successResponse();
    }
}