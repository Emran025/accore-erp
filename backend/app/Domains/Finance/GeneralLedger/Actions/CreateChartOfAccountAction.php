<?php

namespace App\Domains\Finance\GeneralLedger\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class CreateChartOfAccountAction
{
    public function execute(array $data): array
    {
        PermissionService::requirePermission('chart_of_accounts', 'create');

        $account = ChartOfAccount::create([
            'account_code' => $data['code'],
            'account_name' => $data['name'],
            'account_type' => ucfirst($data['type']),
            'parent_id' => $data['parent_id'] ?? null,
            'description' => $data['description'] ?? null,
            'is_active' => true,
            'created_by' => auth()->id() ?? session('user_id'),
        ]);

        TelescopeService::logOperation('CREATE', 'chart_of_accounts', $account->id, null, $data);

        return ['id' => $account->id];
    }
}
