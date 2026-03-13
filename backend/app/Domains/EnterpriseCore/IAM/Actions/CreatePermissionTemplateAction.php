<?php

namespace App\Domains\EnterpriseCore\IAM\Actions;

use App\Domains\EnterpriseCore\IAM\Models\PermissionTemplate;

class CreatePermissionTemplateAction
{
    public function execute(array $data): array
    {
        $data['created_by'] = auth()->id();
        return PermissionTemplate::create($data)->toArray();
    }
}
