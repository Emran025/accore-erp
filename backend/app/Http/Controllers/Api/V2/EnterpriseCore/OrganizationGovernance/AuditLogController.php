<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\OrganizationGovernance;

use App\Http\Controllers\Controller;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\ListAuditLogsAction;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\ListAuditLogsRequest;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Resources\EnterpriseCore\OrganizationGovernance\AuditLogResource;

class AuditLogController extends Controller
{
    use BaseApiController;

    public function index(ListAuditLogsRequest $request, ListAuditLogsAction $action): JsonResponse
    {
        $logs = $action->execute($request->validated());

        return $this->successResponse(AuditLogResource::collection($logs));
    }
}