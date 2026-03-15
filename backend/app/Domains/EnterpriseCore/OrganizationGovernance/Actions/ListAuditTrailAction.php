<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\HumanCapital\HRCompliance\Models\Telescope;

class ListAuditTrailAction
{
    public function execute(array $filters = []): array
    {
        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 20)));

        $query = Telescope::with('user');

        if (!empty($filters['table_name'])) $query->where('table_name', $filters['table_name']);
        if (!empty($filters['record_id'])) $query->where('record_id', $filters['record_id']);
        if (!empty($filters['user_id'])) $query->where('user_id', $filters['user_id']);
        if (!empty($filters['operation'])) $query->where('operation', $filters['operation']);
        if (!empty($filters['start_date'])) $query->where('created_at', '>=', $filters['start_date']);
        if (!empty($filters['end_date'])) $query->where('created_at', '<=', $filters['end_date'] . ' 23:59:59');

        $total = $query->count();
        $logs = $query->orderBy('created_at', 'desc')
            ->skip(($page - 1) * $perPage)->take($perPage)->get()
            ->map(fn($log) => [
                'id' => $log->id,
                'user_id' => $log->user_id,
                'user_name' => $log->user?->username,
                'operation' => $log->operation,
                'table_name' => $log->table_name,
                'record_id' => $log->record_id,
                'old_values' => $log->old_values,
                'new_values' => $log->new_values,
                'ip_address' => $log->ip_address,
                'user_agent' => $log->user_agent,
                'created_at' => $log->created_at,
            ]);

        // Get summary statistics
        $stats = Telescope::when(!empty($filters['table_name']), fn($q) => $q->where('table_name', $filters['table_name']))
            ->when(!empty($filters['start_date']), fn($q) => $q->where('created_at', '>=', $filters['start_date']))
            ->when(!empty($filters['end_date']), fn($q) => $q->where('created_at', '<=', $filters['end_date'] . ' 23:59:59'))
            ->selectRaw('operation, COUNT(*) as count')->groupBy('operation')->pluck('count', 'operation')->toArray();

        return [
            'data' => [
                'logs' => $logs,
                'statistics' => $stats,
            ],
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total_records' => $total,
                'total_pages' => ceil($total / $perPage),
            ],
        ];
    }
}
