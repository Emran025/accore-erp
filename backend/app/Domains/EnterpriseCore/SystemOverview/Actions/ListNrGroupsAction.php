<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Models\NrGroup;
use Illuminate\Database\Eloquent\Collection;

class ListNrGroupsAction
{
    public function execute(int $objectId): Collection
    {
        return NrGroup::where('nr_object_id', $objectId)
            ->with(['intervals'])
            ->orderBy('code')
            ->get();
    }
}
