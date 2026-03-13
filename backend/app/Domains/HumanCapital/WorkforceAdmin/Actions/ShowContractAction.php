<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\EmployeeContract;
use Illuminate\Http\JsonResponse;

class ShowContractAction extends Action
{
    public function __construct(private readonly int $id) {}

    public function __invoke(): JsonResponse
    {
        $contract = EmployeeContract::with(['employee', 'creator'])->findOrFail($this->id);
        return $this->successResponse($contract->toArray());
    }
}
