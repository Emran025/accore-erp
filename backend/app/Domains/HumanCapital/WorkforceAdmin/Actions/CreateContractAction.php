<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\EmployeeContract;

class CreateContractAction
{
    public function execute(array $data): EmployeeContract
    {
        $data['created_by'] = auth()->id();
        $data['contract_number'] = $data['contract_number'] ?? ('CTR-' . date('Ymd') . '-' . str_pad(EmployeeContract::count() + 1, 5, '0', STR_PAD_LEFT));
        $data['renewal_reminder_sent'] = false;

        $contract = EmployeeContract::create($data);

        if (($data['is_current'] ?? false) === true) {
            EmployeeContract::where('employee_id', $data['employee_id'])
                ->where('id', '!=', $contract->id)
                ->update(['is_current' => false]);
        }

        return $contract->load(['employee', 'creator']);
    }
}
