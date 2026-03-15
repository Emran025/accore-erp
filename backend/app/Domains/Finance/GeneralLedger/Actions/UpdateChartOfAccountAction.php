<?php

namespace App\Domains\Finance\GeneralLedger\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateChartOfAccountAction
{
    public function execute(int $id, array $data): array
    {
        $account = ChartOfAccount::findOrFail($id);
        $oldValues = $account->toArray();
        
        $account->update([
            'account_name' => $data['name'],
            'account_type' => ucfirst($data['type']),
            'parent_id' => $data['parent_id'] ?? null,
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'] ?? $account->is_active,
        ]);

        TelescopeService::logOperation('UPDATE', 'chart_of_accounts', $account->id, $oldValues, $data);

        return ['id' => $account->id];
    }
}
