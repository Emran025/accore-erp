<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\EmployeeContract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListContractsAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $query = EmployeeContract::with(['employee', 'creator'])->orderByDesc('contract_start_date');

        if ($this->request->filled('employee_id')) {
            $query->where('employee_id', $this->request->employee_id);
        }

        if ($this->request->filled('is_current')) {
            $query->where('is_current', $this->request->is_current === 'true');
        }

        return $this->successResponse($query->paginate(15)->toArray());
    }
}
