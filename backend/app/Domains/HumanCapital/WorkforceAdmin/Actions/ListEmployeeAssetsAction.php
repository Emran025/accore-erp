<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\AssetManagement\Models\EmployeeAsset;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListEmployeeAssetsAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        PermissionService::requirePermission('employees', 'view');
        $query = EmployeeAsset::with(['employee', 'costCenter']);
        
        if ($this->request->filled('employee_id')) {
            $query->where('employee_id', $this->request->employee_id);
        }
        
        if ($this->request->filled('status')) {
            $query->where('status', $this->request->status);
        }
        
        return $this->successResponse($query->paginate(15)->toArray());
    }
}
