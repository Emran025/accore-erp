<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Models\PermissionTemplate;

class UpdatePermissionTemplateAction
{
    public function execute(int|string $id, array $data): PermissionTemplate
    {
        $template = PermissionTemplate::findOrFail($id);
        $template->update($data);
        return $template;
    }
}
