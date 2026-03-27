<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\EmployeeContract;

class ShowContractAction
{
    public function execute(int $id): EmployeeContract
    {
        return EmployeeContract::with(['employee', 'creator'])->findOrFail($id);
    }
}
