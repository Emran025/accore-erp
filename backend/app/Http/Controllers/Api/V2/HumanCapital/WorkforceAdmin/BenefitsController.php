<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\WorkforceAdmin;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\Payroll\Models\BenefitsPlan;
use App\Domains\HumanCapital\Payroll\Models\BenefitsEnrollment;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreBenefitsPlanRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\UpdateBenefitsPlanRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreBenefitsEnrollmentRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\UpdateBenefitsEnrollmentRequest;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class BenefitsController extends Controller
{
    use BaseApiController;

    // Plans
    public function indexPlans(Request $request)
    {
        $query = BenefitsPlan::with(['enrollments']);

        if ($request->filled('plan_type')) {
            $query->where('plan_type', $request->plan_type);
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->is_active === 'true');
        }

        $paginated = $query->orderBy('created_at', 'desc')->paginate(15);
        return $this->paginatedResponse(
            $paginated->items(),
            $paginated->total(),
            $paginated->currentPage(),
            $paginated->perPage()
        );
    }

    public function storePlan(StoreBenefitsPlanRequest $request)
    {
        $validated = $request->validated();
        $validated['is_active'] = true;
        $validated['created_by'] = auth()->id();

        $plan = BenefitsPlan::create($validated);
        return response()->json(array_merge(['success' => true], $plan->toArray()), 201);
    }

    public function showPlan($id)
    {
        $plan = BenefitsPlan::with(['enrollments.employee'])->findOrFail($id);
        return $this->successResponse($plan->toArray());
    }

    public function updatePlan(UpdateBenefitsPlanRequest $request, $id)
    {
        $plan = BenefitsPlan::findOrFail($id);

        $validated = $request->validated();

        $plan->update($validated);
        return $this->successResponse($plan->load('enrollments')->toArray());
    }

    // Enrollments
    public function indexEnrollments(Request $request)
    {
        $query = BenefitsEnrollment::with(['plan', 'employee']);

        if ($request->filled('plan_id')) {
            $query->where('plan_id', $request->plan_id);
        }

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $paginated = $query->orderBy('enrollment_date', 'desc')->paginate(15);
        return $this->paginatedResponse(
            $paginated->items(),
            $paginated->total(),
            $paginated->currentPage(),
            $paginated->perPage()
        );
    }

    public function storeEnrollment(StoreBenefitsEnrollmentRequest $request)
    {
        $validated = $request->validated();

        $validated['enrollment_date'] = now();
        $validated['status'] = 'enrolled';

        $enrollment = BenefitsEnrollment::create($validated);
        return response()->json(array_merge(['success' => true], $enrollment->load('plan', 'employee')->toArray()), 201);
    }

    public function updateEnrollment(UpdateBenefitsEnrollmentRequest $request, $id)
    {
        $enrollment = BenefitsEnrollment::findOrFail($id);

        $validated = $request->validated();

        $enrollment->update($validated);
        return $this->successResponse($enrollment->load('plan', 'employee')->toArray());
    }
}
