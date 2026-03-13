<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\ContingentContract;
use App\Domains\HumanCapital\WorkforceAdmin\Models\ContingentWorker;

class CreateContingentContractAction
{
    public function execute(int|string $workerId, array $data): array
    {
        $data['worker_id'] = $workerId;
        $data['contract_number'] = 'CNT-' . date('Ymd') . '-' . str_pad(ContingentContract::count() + 1, 4, '0', STR_PAD_LEFT);
        $data['status'] = 'draft';
        $data['created_by'] = auth()->id();

        $contract = ContingentContract::create($data);
        return $contract->load('worker')->toArray();
    }
}
