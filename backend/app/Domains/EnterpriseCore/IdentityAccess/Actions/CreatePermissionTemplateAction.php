<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Models\PermissionTemplate;

class CreatePermissionTemplateAction
{
    public function execute(array $data): PermissionTemplate
    {
        $data['created_by'] = auth()->id();
        return PermissionTemplate::create($data);
    }
}
