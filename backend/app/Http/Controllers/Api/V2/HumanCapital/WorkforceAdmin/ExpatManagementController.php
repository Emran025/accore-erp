<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\WorkforceAdmin;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreExpatRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\UpdateExpatRequest;
use App\Http\Resources\HumanCapital\WorkforceAdmin\ExpatManagementResource;
use App\Http\Requests\HumanCapital\WorkforceAdmin\ListExpatRecordsRequest;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\ListExpatRecordsAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\CreateExpatRecordAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\ShowExpatRecordAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\UpdateExpatRecordAction;
use App\Domains\HumanCapital\WorkforceAdmin\Actions\DeleteExpatRecordAction;

class ExpatManagementController extends Controller
{
    use BaseApiController;

    public function index(ListExpatRecordsRequest $request, ListExpatRecordsAction $action)
    {
        $paginator = $action->execute($request->validated());
        return $this->paginatedResponse(
            ExpatManagementResource::collection($paginator->items()),
            $paginator->total(),
            $paginator->currentPage(),
            $paginator->perPage()
        );
    }

    public function store(StoreExpatRequest $request, CreateExpatRecordAction $action)
    {
        $expat = $action->execute($request->validated());
        return $this->successResponse(new ExpatManagementResource($expat), 'Expat record created successfully', 201);
    }

    public function show($id, ShowExpatRecordAction $action)
    {
        $expat = $action->execute($id);
        return $this->successResponse(new ExpatManagementResource($expat));
    }

    public function update(UpdateExpatRequest $request, $id, UpdateExpatRecordAction $action)
    {
        $expat = $action->execute((int)$id, $request->validated());
        return $this->successResponse(new ExpatManagementResource($expat), 'Expat record updated successfully');
    }

    public function destroy($id, DeleteExpatRecordAction $action)
    {
        $action->execute((int)$id);
        return $this->successResponse([], 'Expat record deleted successfully');
    }
}
