<?php

namespace App\Domains\Finance\TaxCompliance\Actions;

use App\Domains\Finance\TaxCompliance\Models\TaxAuthority;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class UpdateTaxAuthorityAction
{
    public function execute(array $data, int $id): array
    {
        PermissionService::requirePermission('settings', 'edit');

        $authority = TaxAuthority::findOrFail($id);
        $authority->update($data);

        return ['authority' => $authority->fresh()->toArray()];
    }
}
