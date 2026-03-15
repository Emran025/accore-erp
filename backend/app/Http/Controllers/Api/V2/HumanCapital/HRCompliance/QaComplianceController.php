<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\HRCompliance;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\HRCompliance\StoreQaComplianceRequest;
use App\Http\Requests\HumanCapital\HRCompliance\UpdateQaComplianceRequest;
use App\Http\Requests\HumanCapital\HRCompliance\StoreCapaRequest;
use App\Domains\HumanCapital\HRCompliance\Actions\ListQaCompliancesAction;
use App\Domains\HumanCapital\HRCompliance\Actions\CreateQaComplianceAction;
use App\Domains\HumanCapital\HRCompliance\Actions\ShowQaComplianceAction;
use App\Domains\HumanCapital\HRCompliance\Actions\UpdateQaComplianceAction;
use App\Domains\HumanCapital\HRCompliance\Actions\CreateCapaAction;
use App\Domains\Manufacturing\QualityControl\Models\QaCompliance;
use App\Domains\Manufacturing\QualityControl\Models\Capa;
use App\Http\Resources\Manufacturing\QualityControl\QaComplianceResource;
use App\Http\Resources\Manufacturing\QualityControl\CapaResource;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Http\JsonResponse;

class QaComplianceController extends Controller
{
    use BaseApiController;

    public function index(Request $request, ListQaCompliancesAction $action): JsonResponse
    {
        $filters = $request->only(['compliance_type', 'status', 'employee_id']);
        $compliances = $action->execute($filters);
        
        $data = $compliances['data'] ?? $compliances;
        return $this->successResponse(QaComplianceResource::collection($data));
    }

    public function store(StoreQaComplianceRequest $request, CreateQaComplianceAction $action): JsonResponse
    {
        $validated = $request->validated();
        $complianceData = $action->execute($validated);
        $compliance = QaCompliance::find($complianceData['id'] ?? $complianceData);

        return $this->successResponse(new QaComplianceResource($compliance), 'Compliance record created', 201);
    }

    public function show($id, ShowQaComplianceAction $action): JsonResponse
    {
        $complianceData = $action->execute($id);
        $compliance = QaCompliance::find($id);
        return $this->successResponse(new QaComplianceResource($compliance));
    }

    public function update(UpdateQaComplianceRequest $request, $id, UpdateQaComplianceAction $action): JsonResponse
    {
        $validated = $request->validated();
        $complianceData = $action->execute($id, $validated);
        $compliance = QaCompliance::find($id);
        
        return $this->successResponse(new QaComplianceResource($compliance), 'Compliance record updated');
    }

    public function storeCapa(StoreCapaRequest $request, $complianceId, CreateCapaAction $action): JsonResponse
    {
        $validated = $request->validated();
        $capaData = $action->execute($complianceId, $validated);
        $capa = Capa::find($capaData['id'] ?? $capaData);

        return $this->successResponse(new CapaResource($capa), 'CAPA record created', 201);
    }
}
