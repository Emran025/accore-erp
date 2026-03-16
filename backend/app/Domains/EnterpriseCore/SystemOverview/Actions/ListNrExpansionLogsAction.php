<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Models\NrExpansionLog;
use Illuminate\Database\Eloquent\Collection;

class ListNrExpansionLogsAction
{
    public function execute(int $intervalId): Collection
    {
        return NrExpansionLog::where('nr_interval_id', $intervalId)
            ->with('expandedBy')
            ->orderByDesc('created_at')
            ->get();
    }
}
