<?php

namespace App\Domains\EnterpriseCore\IAM\Actions;

use App\Domains\EnterpriseCore\IAM\Models\PermissionTemplate;
use App\Domains\EnterpriseCore\IAM\Models\Role;
use App\Domains\EnterpriseCore\IAM\Models\RolePermission;
use App\Domains\EnterpriseCore\Governance\Models\Module;

class ApplyPermissionTemplateAction
{
    public function execute(array $data): void
    {
        $template = PermissionTemplate::findOrFail($data['template_id']);
        $role = Role::findOrFail($data['role_id']);

        foreach ($template->permissions as $perm) {
            $module = Module::where('module_key', $perm['module_key'])->first();
            if (!$module) continue;

            RolePermission::updateOrCreate(
                ['role_id' => $role->id, 'module_id' => $module->id],
                [
                    'can_view'   => $perm['can_view'],
                    'can_create' => $perm['can_create'],
                    'can_edit'   => $perm['can_edit'],
                    'can_delete' => $perm['can_delete'],
                    'created_by' => auth()->id(),
                ]
            );
        }
    }
}
