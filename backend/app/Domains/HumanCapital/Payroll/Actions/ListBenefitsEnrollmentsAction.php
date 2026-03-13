<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\Payroll\Models\BenefitsEnrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListBenefitsEnrollmentsAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $query = BenefitsEnrollment::with(['plan', 'employee']);
        if ($this->request->filled('plan_id')) $query->where('plan_id', $this->request->plan_id);
        if ($this->request->filled('employee_id')) $query->where('employee_id', $this->request->employee_id);
        if ($this->request->filled('status')) $query->where('status', $this->request->status);
        $paginated = $query->orderBy('enrollment_date', 'desc')->paginate(15);
        return $this->paginatedResponse($paginated->items(), $paginated->total(), $paginated->currentPage(), $paginated->perPage());
    }
}
