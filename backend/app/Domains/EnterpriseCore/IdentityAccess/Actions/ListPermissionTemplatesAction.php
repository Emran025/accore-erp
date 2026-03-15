<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Models\PermissionTemplate;

class ListPermissionTemplatesAction
{
    public function execute(): array
    {
        return PermissionTemplate::where('is_active', true)->orderBy('template_name')->get()->toArray();
    }
}
