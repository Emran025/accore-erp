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

        return $this->successResponse($data);
    }

    public function storeIncident(StoreEhsIncidentRequest $request): JsonResponse
    {
        $data = (new CreateEhsIncidentAction())->execute($request->validated());

        return response()->json(array_merge(['success' => true], $data), 201);
    }

    public function updateIncident(UpdateEhsIncidentRequest $request, $id): JsonResponse
    {
        $data = (new UpdateEhsIncidentAction())->execute((int) $id, $request->validated());

        return $this->successResponse($data);
    }

    // Health Records
    public function indexHealthRecords(Request $request): JsonResponse
    {
        $filters = $request->only(['employee_id', 'record_type']);

        $data = (new ListHealthRecordsAction())->execute($filters);

        return $this->successResponse($data);
    }

    public function storeHealthRecord(StoreHealthRecordRequest $request): JsonResponse
    {
        $data = (new CreateHealthRecordAction())->execute($request->validated());

        return response()->json(array_merge(['success' => true], $data), 201);
    }

    // PPE Management
    public function indexPpe(Request $request): JsonResponse
    {
        $filters = $request->only(['employee_id', 'status']);

        $data = (new ListPpeAction())->execute($filters);

        return $this->successResponse($data);
    }

    public function storePpe(StorePpeRequest $request): JsonResponse
    {
        $data = (new CreatePpeAction())->execute($request->validated());

        return response()->json(array_merge(['success' => true], $data), 201);
    }
}
