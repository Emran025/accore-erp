<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\ContingentWorker;

class ShowContingentWorkerAction
{
    public function execute(int|string $id): array
    {
        $worker = ContingentWorker::with(['contracts'])->findOrFail($id);
        return $worker->toArray();
    }
}
