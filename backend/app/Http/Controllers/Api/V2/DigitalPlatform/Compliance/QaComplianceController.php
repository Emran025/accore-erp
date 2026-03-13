<?php

namespace App\Http\Controllers\Api\V2\DigitalPlatform\Compliance;

use App\Http\Controllers\Controller;
use App\Http\Requests\DigitalPlatform\Compliance\StoreQaComplianceRequest;
use App\Http\Requests\DigitalPlatform\Compliance\UpdateQaComplianceRequest;
use App\Http\Requests\DigitalPlatform\Compliance\StoreCapaRequest;
use App\Domains\DigitalPlatform\Compliance\Actions\ListQaCompliancesAction;
use App\Domains\DigitalPlatform\Compliance\Actions\CreateQaComplianceAction;
use App\Domains\DigitalPlatform\Compliance\Actions\ShowQaComplianceAction;
use App\Domains\DigitalPlatform\Compliance\Actions\UpdateQaComplianceAction;
use App\Domains\DigitalPlatform\Compliance\Actions\CreateCapaAction;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class QaComplianceController extends Controller
{
    use BaseApiController;

    public function index(Request $request, ListQaCompliancesAction $action)
    {
        $filters = $request->only(['compliance_type', 'status', 'employee_id']);
        $compliances = $action->execute($filters);
        
        return $this->successResponse($compliances);
    }

    public function store(StoreQaComplianceRequest $request, CreateQaComplianceAction $action)
    {
        $validated = $request->validated();
        $compliance = $action->execute($validated);

        return response()->json(array_merge(['success' => true], $compliance), 201);
    }

    public function show($id, ShowQaComplianceAction $action)
    {
        $compliance = $action->execute($id);
        return $this->successResponse($compliance);
    }

    public function update(UpdateQaComplianceRequest $request, $id, UpdateQaComplianceAction $action)
    {
        $validated = $request->validated();
        $compliance = $action->execute($id, $validated);
        
        return $this->successResponse($compliance);
    }

    public function storeCapa(StoreCapaRequest $request, $complianceId, CreateCapaAction $action)
    {
        $validated = $request->validated();
        $capa = $action->execute($complianceId, $validated);

        return response()->json(array_merge(['success' => true], $capa), 201);
    }
}
