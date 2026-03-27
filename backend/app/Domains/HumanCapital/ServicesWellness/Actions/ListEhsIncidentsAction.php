<?php

namespace App\Domains\HumanCapital\ServicesWellness\Actions;

use App\Domains\HumanCapital\ServicesWellness\Models\EhsIncident;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListEhsIncidentsAction
{
    public function execute(array $filters = []): LengthAwarePaginator
    {
        $query = EhsIncident::with(['employee']);

        if (!empty($filters['incident_type'])) {
            $query->where('incident_type', $filters['incident_type']);
        }

        if (!empty($filters['severity'])) {
            $query->where('severity', $filters['severity']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('incident_date', 'desc')->paginate(15);
    }
}
