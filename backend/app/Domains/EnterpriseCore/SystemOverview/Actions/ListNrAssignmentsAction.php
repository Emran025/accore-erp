<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Models\NrGroupIntervalAssignment;
use Illuminate\Database\Eloquent\Collection;

class ListNrAssignmentsAction
{
    public function execute(int $objectId): Collection
    {
        return NrGroupIntervalAssignment::where('nr_object_id', $objectId)
            ->with(['group', 'interval'])
            ->orderBy('nr_group_id')
            ->get();
    }
}
