<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\EmployeeContract;

class UpdateContractAction
{
    public function execute(int $id, array $data): EmployeeContract
    {
        $contract = EmployeeContract::findOrFail($id);
        $contract->update($data);

        if (($data['is_current'] ?? false) === true) {
            EmployeeContract::where('employee_id', $contract->employee_id)
                ->where('id', '!=', $contract->id)
                ->update(['is_current' => false]);
        }

        return $contract->load(['employee', 'creator']);
    }
}
