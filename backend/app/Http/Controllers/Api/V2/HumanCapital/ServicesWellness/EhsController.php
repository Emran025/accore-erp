<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\ServicesWellness;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\ServicesWellness\Actions\CreateEhsIncidentAction;
use App\Domains\HumanCapital\ServicesWellness\Actions\CreateHealthRecordAction;
use App\Domains\HumanCapital\ServicesWellness\Actions\CreatePpeAction;
use App\Domains\HumanCapital\ServicesWellness\Actions\ListEhsIncidentsAction;
use App\Domains\HumanCapital\ServicesWellness\Actions\ListHealthRecordsAction;
use App\Domains\HumanCapital\ServicesWellness\Actions\ListPpeAction;
use App\Domains\HumanCapital\ServicesWellness\Actions\UpdateEhsIncidentAction;
use App\Http\Requests\HumanCapital\ServicesWellness\StoreEhsIncidentRequest;
use App\Http\Requests\HumanCapital\ServicesWellness\StoreHealthRecordRequest;
use App\Http\Requests\HumanCapital\ServicesWellness\StorePpeRequest;
use App\Http\Requests\HumanCapital\ServicesWellness\UpdateEhsIncidentRequest;
use App\Http\Resources\HumanCapital\ServicesWellness\EhsIncidentResource;
use App\Http\Resources\HumanCapital\ServicesWellness\EmployeeHealthRecordResource;
use App\Http\Resources\HumanCapital\ServicesWellness\PpeManagementResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class EhsController extends Controller
{
    use BaseApiController;

    // Incidents
    public function indexIncidents(Request $request, ListEhsIncidentsAction $action): JsonResponse
    {
        $paginator = $action->execute($request->all());
        return $this->successResponse(EhsIncidentResource::collection($paginator));
    }

    public function storeIncident(StoreEhsIncidentRequest $request, CreateEhsIncidentAction $action): JsonResponse
    {
        $incident = $action->execute($request->validated());
        return $this->successResponse(new EhsIncidentResource($incident), 'Incident recorded successfully', 201);
    }

    public function updateIncident(UpdateEhsIncidentRequest $request, $id, UpdateEhsIncidentAction $action): JsonResponse
    {
        $incident = $action->execute((int) $id, $request->validated());
        return $this->successResponse(new EhsIncidentResource($incident), 'Incident updated successfully');
    }

    // Health Records
    public function indexHealthRecords(Request $request, ListHealthRecordsAction $action): JsonResponse
    {
        $paginator = $action->execute($request->all());
        return $this->successResponse(EmployeeHealthRecordResource::collection($paginator));
    }

    public function storeHealthRecord(StoreHealthRecordRequest $request, CreateHealthRecordAction $action): JsonResponse
    {
        $record = $action->execute($request->validated());
        return $this->successResponse(new EmployeeHealthRecordResource($record), 'Health record created successfully', 201);
    }

    // PPE Management
    public function indexPpe(Request $request, ListPpeAction $action): JsonResponse
    {
        $paginator = $action->execute($request->all());
        return $this->successResponse(PpeManagementResource::collection($paginator));
    }

    public function storePpe(StorePpeRequest $request, CreatePpeAction $action): JsonResponse
    {
        $ppe = $action->execute($request->validated());
        return $this->successResponse(new PpeManagementResource($ppe), 'PPE assignment created successfully', 201);
    }
}
