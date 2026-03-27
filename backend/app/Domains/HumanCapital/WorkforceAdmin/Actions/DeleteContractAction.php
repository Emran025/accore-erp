<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\EmployeeContract;
use Illuminate\Http\JsonResponse;

class DeleteContractAction
{
    public function execute(int $id): bool
    {
        $contract = EmployeeContract::findOrFail($id);
        return $contract->delete();
    }
}
