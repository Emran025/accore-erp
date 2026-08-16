<?php

use App\Domains\EnterpriseCore\IdentityAccess\Models\Role;
use App\Domains\EnterpriseCore\IdentityAccess\Models\RolePermission;
use App\Domains\EnterpriseCore\OrganizationGovernance\Models\Module;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $accountantRoleId = Role::query()->where('role_key', 'accountant')->value('id');
        $salesModuleId = Module::query()->where('module_key', 'sales')->value('id');

        if ($accountantRoleId !== null && $salesModuleId !== null) {
            RolePermission::query()
                ->where('role_id', $accountantRoleId)
                ->where('module_id', $salesModuleId)
                ->delete();
        }
    }

    public function down(): void
    {
        // The removed permission was intentionally broader than the standard
        // accountant role. It is not recreated on rollback.
    }
};
