<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\OrganizationGovernance;

use App\Http\Controllers\Controller;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\ListAuditLogsAction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class AuditLogController extends Controller
{
    use BaseApiController;

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['date_from', 'date_to', 'action', 'module', 'search', 'limit']);

        $data = (new ListAuditLogsAction())->execute($filters);

        return response()->json(array_merge(['success' => true], $data));
    }
}