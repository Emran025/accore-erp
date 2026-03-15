<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\OrganizationGovernance;

use App\Http\Controllers\Controller;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\ListAuditTrailAction;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\ListAuditTrailRequest;
use App\Http\Resources\EnterpriseCore\OrganizationGovernance\AuditLogResource;
use App\Domains\HumanCapital\HRCompliance\Models\Telescope;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class AuditTrailController extends Controller
{
    use BaseApiController;

    public function index(ListAuditTrailRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $data = (new ListAuditTrailAction())->execute($validated);
        
        $logs = Telescope::with('user')->whereIn('id', collect($data['data']['logs'])->pluck('id'))->get();

        return $this->successResponse([
            'logs'       => AuditLogResource::collection($logs),
            'statistics' => $data['data']['statistics'],
            'pagination' => $data['pagination']
        ]);
    }
}