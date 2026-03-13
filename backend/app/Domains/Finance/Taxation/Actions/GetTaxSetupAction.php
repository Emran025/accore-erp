<?php

namespace App\Domains\Finance\Taxation\Actions;

use App\Domains\Finance\Taxation\Models\TaxAuthority;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class GetTaxSetupAction
{
    public function execute(): array
    {
        PermissionService::requirePermission('settings', 'view');

        $authorities = TaxAuthority::with(['taxTypes.taxRates' => function ($q) {
            $q->where('is_default', true)->orWhere('effective_to', null);
        }])->get();

        return ['authorities' => $authorities->toArray()];
    }
}
