<?php
namespace App\Domains\Finance\Currency\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\Currency\Models\Currency;
use Illuminate\Http\JsonResponse;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class ListCurrenciesAction
{
    public function execute(): array
    {
        PermissionService::requirePermission('currency', 'view');
        
        return Currency::with('denominations')->get()->toArray();
    }
}
