<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\ContingentWorker;

class UpdateContingentWorkerAction
{
    public function execute(int|string $id, array $data): array
    {
        $worker = ContingentWorker::findOrFail($id);
        $worker->update($data);

        return $worker->load('contracts')->toArray();
    }
}
