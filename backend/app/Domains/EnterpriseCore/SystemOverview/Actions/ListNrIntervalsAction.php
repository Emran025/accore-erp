<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Models\NrInterval;
use App\Domains\EnterpriseCore\SystemOverview\Services\NumberRangeService;
use Illuminate\Database\Eloquent\Collection;

class ListNrIntervalsAction
{
    public function __construct(private readonly NumberRangeService $service) {}

    public function execute(int $objectId): Collection
    {
        return NrInterval::where('nr_object_id', $objectId)
            ->with('groups')
            ->orderBy('from_number')
            ->get();
    }
}
