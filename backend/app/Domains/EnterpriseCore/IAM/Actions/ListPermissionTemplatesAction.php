<?php

namespace App\Domains\EnterpriseCore\IAM\Actions;

use App\Domains\EnterpriseCore\IAM\Models\PermissionTemplate;

class ListPermissionTemplatesAction
{
    public function execute(): array
    {
        return PermissionTemplate::where('is_active', true)->orderBy('template_name')->get()->toArray();
    }
}
