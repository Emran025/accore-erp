<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\OrganizationGovernance;

use App\Http\Controllers\Controller;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\ListAuditTrailAction;
use App\Http\Requests\EnterpriseCore\OrganizationGovernance\ListAuditTrailRequest;
use App\Http\Resources\EnterpriseCore\OrganizationGovernance\AuditLogResource;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class AuditTrailController extends Controller
{
    use BaseApiController;

    public function index(ListAuditTrailRequest $request, ListAuditTrailAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());

        return $this->paginatedResponse(
            AuditLogResource::collection($result['logs']),
            $result['logs']->total(),
            $result['logs']->currentPage(),
            $result['logs']->perPage()
        );
    }
}