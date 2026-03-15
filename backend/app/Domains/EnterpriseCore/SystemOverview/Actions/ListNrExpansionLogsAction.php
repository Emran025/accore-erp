<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrExpansionLog;
use Illuminate\Http\JsonResponse;

class ListNrExpansionLogsAction extends Action
{
    public function __construct(private readonly int $intervalId) {}

    public function __invoke(): JsonResponse
    {
        $logs = NrExpansionLog::where('nr_interval_id', $this->intervalId)
            ->with('expandedBy')
            ->orderByDesc('created_at')
            ->get();

        return $this->successResponse(['data' => $logs->toArray()]);
    }
}
