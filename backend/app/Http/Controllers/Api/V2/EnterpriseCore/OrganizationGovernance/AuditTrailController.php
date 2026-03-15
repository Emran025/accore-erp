<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\OrganizationGovernance;

use App\Http\Controllers\Controller;
use App\Domains\EnterpriseCore\OrganizationGovernance\Actions\ListAuditTrailAction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class AuditTrailController extends Controller
{
    use BaseApiController;

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'page', 'per_page', 'table_name', 'record_id',
            'user_id', 'operation', 'start_date', 'end_date',
        ]);

        $data = (new ListAuditTrailAction())->execute($filters);

        return response()->json(array_merge(['success' => true], $data));
    }
}