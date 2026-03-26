<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\WorkforceAdmin;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\PayrollBenefits\Models\BenefitsPlan;
use App\Domains\HumanCapital\PayrollBenefits\Models\BenefitsEnrollment;
use App\Http\Requests\HumanCapital\WorkforceAdmin\ListBenefitsPlanRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreBenefitsPlanRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\UpdateBenefitsPlanRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\ListBenefitsEnrollmentRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\StoreBenefitsEnrollmentRequest;
use App\Http\Requests\HumanCapital\WorkforceAdmin\UpdateBenefitsEnrollmentRequest;
use App\Http\Resources\HumanCapital\PayrollBenefits\BenefitsPlanResource;
use App\Http\Resources\HumanCapital\PayrollBenefits\BenefitsEnrollmentResource;
use App\Domains\HumanCapital\PayrollBenefits\Actions\ListBenefitsPlansAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\CreateBenefitsPlanAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\UpdateBenefitsPlanAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\ListBenefitsEnrollmentsAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\CreateBenefitsEnrollmentAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\UpdateBenefitsEnrollmentAction;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class BenefitsController extends Controller
{
    use BaseApiController;

    // Plans
    public function indexPlans(ListBenefitsPlanRequest $request, ListBenefitsPlansAction $action): JsonResponse
    {
        $paginated = $action->execute($request->validated());

        return $this->paginatedResponse(
            BenefitsPlanResource::collection($paginated->items()),
            $paginated->total(),
            $paginated->currentPage(),
            $paginated->perPage()
        );
    }

    public function storePlan(StoreBenefitsPlanRequest $request, CreateBenefitsPlanAction $action): JsonResponse
    {
        $userId = auth()->id();
        $plan = $action->execute($request->validated(), (int)$userId);

        return $this->successResponse(new BenefitsPlanResource($plan), 'Benefits plan created successfully', 201);
    }

    public function showPlan($id): JsonResponse
    {
        $plan = BenefitsPlan::with(['enrollments.employee'])->findOrFail($id);
        return $this->successResponse(new BenefitsPlanResource($plan));
    }

    public function updatePlan(UpdateBenefitsPlanRequest $request, $id, UpdateBenefitsPlanAction $action): JsonResponse
    {
        $plan = $action->execute((int)$id, $request->validated());
        return $this->successResponse(new BenefitsPlanResource($plan->load('enrollments')), 'Benefits plan updated successfully');
    }

    // Enrollments
    public function indexEnrollments(ListBenefitsEnrollmentRequest $request, ListBenefitsEnrollmentsAction $action): JsonResponse
    {
        $paginated = $action->execute($request->validated());

        return $this->paginatedResponse(
            BenefitsEnrollmentResource::collection($paginated->items()),
            $paginated->total(),
            $paginated->currentPage(),
            $paginated->perPage()
        );
    }

    public function storeEnrollment(StoreBenefitsEnrollmentRequest $request, CreateBenefitsEnrollmentAction $action): JsonResponse
    {
        $enrollment = $action->execute($request->validated());
        return $this->successResponse(new BenefitsEnrollmentResource($enrollment->load('plan', 'employee')), 'Benefits enrollment created successfully', 201);
    }

    public function updateEnrollment(UpdateBenefitsEnrollmentRequest $request, $id, UpdateBenefitsEnrollmentAction $action): JsonResponse
    {
        $enrollment = $action->execute((int)$id, $request->validated());
        return $this->successResponse(new BenefitsEnrollmentResource($enrollment->load('plan', 'employee')), 'Benefits enrollment updated successfully');
    }
}
