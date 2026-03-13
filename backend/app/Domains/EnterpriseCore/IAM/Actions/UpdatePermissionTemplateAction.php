<?php

namespace App\Domains\EnterpriseCore\IAM\Actions;

use App\Domains\EnterpriseCore\IAM\Models\PermissionTemplate;

class UpdatePermissionTemplateAction
{
    public function execute(int|string $id, array $data): array
    {
        $template = PermissionTemplate::findOrFail($id);
        $template->update($data);
        return $template->toArray();
    }
}
