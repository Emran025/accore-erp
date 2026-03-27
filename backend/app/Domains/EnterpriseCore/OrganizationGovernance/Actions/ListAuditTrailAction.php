<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\HumanCapital\HRCompliance\Models\Telescope;

use Illuminate\Support\Collection;

class ListAuditTrailAction
{
    public function execute(array $filters = []): Collection
    {
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 20)));

        $query = Telescope::with('user');

        if (!empty($filters['table_name'])) $query->where('table_name', $filters['table_name']);
        if (!empty($filters['record_id'])) $query->where('record_id', $filters['record_id']);
        if (!empty($filters['user_id'])) $query->where('user_id', $filters['user_id']);
        if (!empty($filters['operation'])) $query->where('operation', $filters['operation']);
        if (!empty($filters['start_date'])) $query->where('created_at', '>=', $filters['start_date']);
        $paginator = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // Get summary statistics
        $stats = Telescope::when(!empty($filters['table_name']), fn($q) => $q->where('table_name', $filters['table_name']))
            ->when(!empty($filters['start_date']), fn($q) => $q->where('created_at', '>=', $filters['start_date']))
            ->when(!empty($filters['end_date']), fn($q) => $q->where('created_at', '<=', $filters['end_date'] . ' 23:59:59'))
            ->selectRaw('operation, COUNT(*) as count')->groupBy('operation')->pluck('count', 'operation')->toArray();

        return collect([
            'logs' => $paginator,
            'statistics' => $stats,
            'pagination' => $paginator,
        ]);
    }
}
