<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\Payroll\Models\BenefitsPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListBenefitsPlansAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $query = BenefitsPlan::with(['enrollments']);
        if ($this->request->filled('plan_type')) $query->where('plan_type', $this->request->plan_type);
        if ($this->request->filled('is_active')) $query->where('is_active', $this->request->is_active === 'true');
        $paginated = $query->orderBy('created_at', 'desc')->paginate(15);
        return $this->paginatedResponse($paginated->items(), $paginated->total(), $paginated->currentPage(), $paginated->perPage());
    }
}
