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
use App\Domains\HumanCapital\ServicesWellness\Models\EhsIncident;
use App\Domains\HumanCapital\ServicesWellness\Models\EmployeeHealthRecord;
use App\Domains\HumanCapital\ServicesWellness\Models\PpeManagement;
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
    public function indexIncidents(Request $request): JsonResponse
    {
        $filters = $request->only(['incident_type', 'severity', 'status']);

        $data = (new ListEhsIncidentsAction())->execute($filters);
        return $this->paginatedResponse(
            EhsIncidentResource::collection($data['data'] ?? $data),
            $data['total'] ?? count($data['data'] ?? $data),
            $data['current_page'] ?? 1,
            $data['per_page'] ?? 15
        );
    }

    public function storeIncident(StoreEhsIncidentRequest $request): JsonResponse
    {
        $result = (new CreateEhsIncidentAction())->execute($request->validated());
        $incident = EhsIncident::find($result['id'] ?? $result);
        return $this->successResponse(new EhsIncidentResource($incident), 'Incident recorded successfully', 201);
    }

    public function updateIncident(UpdateEhsIncidentRequest $request, $id): JsonResponse
    {
        $result = (new UpdateEhsIncidentAction())->execute((int) $id, $request->validated());
        $incident = EhsIncident::find($result['id'] ?? $id);
        return $this->successResponse(new EhsIncidentResource($incident), 'Incident updated successfully');
    }

    // Health Records
    public function indexHealthRecords(Request $request): JsonResponse
    {
        $filters = $request->only(['employee_id', 'record_type']);

        $data = (new ListHealthRecordsAction())->execute($filters);
        return $this->paginatedResponse(
            EmployeeHealthRecordResource::collection($data['data'] ?? $data),
            $data['total'] ?? count($data['data'] ?? $data),
            $data['current_page'] ?? 1,
            $data['per_page'] ?? 15
        );
    }

    public function storeHealthRecord(StoreHealthRecordRequest $request): JsonResponse
    {
        $result = (new CreateHealthRecordAction())->execute($request->validated());
        $record = EmployeeHealthRecord::find($result['id'] ?? $result);
        return $this->successResponse(new EmployeeHealthRecordResource($record), 'Health record created successfully', 201);
    }

    // PPE Management
    public function indexPpe(Request $request): JsonResponse
    {
        $filters = $request->only(['employee_id', 'status']);

        $data = (new ListPpeAction())->execute($filters);
        return $this->paginatedResponse(
            PpeManagementResource::collection($data['data'] ?? $data),
            $data['total'] ?? count($data['data'] ?? $data),
            $data['current_page'] ?? 1,
            $data['per_page'] ?? 15
        );
    }

    public function storePpe(StorePpeRequest $request): JsonResponse
    {
        $result = (new CreatePpeAction())->execute($request->validated());
        $ppe = PpeManagement::find($result['id'] ?? $result);
        return $this->successResponse(new PpeManagementResource($ppe), 'PPE assignment created successfully', 201);
    }
}
