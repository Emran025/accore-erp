<?php
namespace App\Domains\Finance\ForeignExchange\Actions;

use App\Domains\Finance\ForeignExchange\Models\CurrencyPolicy;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class ListCurrencyPoliciesAction
{
    public function execute(): array
    {
        PermissionService::requirePermission('currency', 'view');
        
        return CurrencyPolicy::orderBy('created_at', 'desc')->get()->toArray();
    }
}
