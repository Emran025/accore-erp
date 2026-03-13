<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\ContingentWorker;

class CreateContingentWorkerAction
{
    public function execute(array $data): array
    {
        $data['worker_code'] = 'CW-' . date('Ymd') . '-' . str_pad(ContingentWorker::count() + 1, 4, '0', STR_PAD_LEFT);
        $data['status'] = 'active';
        $data['created_by'] = auth()->id();

        $worker = ContingentWorker::create($data);
        return current($worker->load('contracts')->toArray()) ?: $worker->load('contracts')->toArray(); // ensure correct typing or just load
    }
}
