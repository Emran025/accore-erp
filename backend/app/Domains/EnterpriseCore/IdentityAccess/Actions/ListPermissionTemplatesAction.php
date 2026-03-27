<?php

namespace App\Domains\EnterpriseCore\IdentityAccess\Actions;

use App\Domains\EnterpriseCore\IdentityAccess\Models\PermissionTemplate;
use Illuminate\Database\Eloquent\Collection;

class ListPermissionTemplatesAction
{
    public function execute(): Collection
    {
        return PermissionTemplate::where('is_active', true)->orderBy('template_name')->get();
    }
}
