<?php

namespace App\Domains\EnterpriseCore\OrganizationGovernance\Actions;

use App\Domains\HumanCapital\HRCompliance\Models\Telescope;

class ListAuditLogsAction
{
    public function execute(array $filters = [])
    {
        $query = Telescope::with('user');

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }
        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }
        if (!empty($filters['action'])) {
            $query->where('operation', $filters['action']);
        }
        if (!empty($filters['module'])) {
            $query->where('table_name', $filters['module']);
        }
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"))
                  ->orWhere('record_id', 'like', "%{$search}%");
            });
        }

        $limit = $filters['limit'] ?? 20;
        return $query->orderBy('created_at', 'desc')->paginate($limit);
    }
}
