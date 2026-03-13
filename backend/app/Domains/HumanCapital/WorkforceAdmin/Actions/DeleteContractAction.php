<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\EmployeeContract;
use Illuminate\Http\JsonResponse;

class DeleteContractAction extends Action
{
    public function __construct(private readonly int $id) {}

    public function __invoke(): JsonResponse
    {
        $contract = EmployeeContract::findOrFail($this->id);
        $contract->delete();
        return $this->successResponse([], 'Contract deleted successfully');
    }
}
