<?php
namespace App\Domains\Finance\ForeignExchange\Actions;

use App\Domains\Finance\ForeignExchange\Models\Currency;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class ListCurrenciesAction
{
    public function execute(): array
    {
        PermissionService::requirePermission('currency', 'view');
        
        return Currency::with('denominations')->get()->toArray();
    }
}
