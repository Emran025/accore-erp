<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\ContingentWorker;

class ListContingentWorkersAction
{
    public function execute(array $filters = []): array
    {
        $query = ContingentWorker::with(['contracts']);

        if (!empty($filters['worker_type'])) {
            $query->where('worker_type', $filters['worker_type']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('worker_code', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->orderBy('created_at', 'desc')->paginate(15)->toArray();
    }
}
