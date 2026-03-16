<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Models\NrObject;
use Illuminate\Database\Eloquent\Collection;

class ListNrObjectsAction
{
    public function execute(): Collection
    {
        return NrObject::withCount(['groups', 'intervals', 'assignments'])
            ->orderBy('name')
            ->get();
    }
}
