<?php
namespace App\Domains\Finance\CurrencyPolicy\Actions;

use App\Domains\Finance\CurrencyPolicy\Models\CurrencyPolicy;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class ListCurrencyPoliciesAction
{
    public function execute(): array
    {
        PermissionService::requirePermission('currency', 'view');
        
        return CurrencyPolicy::orderBy('created_at', 'desc')->get()->toArray();
    }
}
