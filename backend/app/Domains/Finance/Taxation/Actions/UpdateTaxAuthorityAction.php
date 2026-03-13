<?php

namespace App\Domains\Finance\Taxation\Actions;

use App\Domains\Finance\Taxation\Models\TaxAuthority;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

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
