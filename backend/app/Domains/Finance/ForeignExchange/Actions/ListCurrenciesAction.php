<?php
namespace App\Domains\Finance\ForeignExchange\Actions;

use App\Domains\Finance\ForeignExchange\Models\Currency;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
use Illuminate\Database\Eloquent\Collection;

class ListCurrenciesAction
{
    public function execute(): Collection
    {
        PermissionService::requirePermission('currency', 'view');
        
        return Currency::with('denominations')->get();
    }
}
