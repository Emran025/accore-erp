<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\PayrollBenefits;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\PayrollBenefits\Actions\CalculateEOSBAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\PreviewEOSBCalculationAction;
use App\Http\Requests\HumanCapital\PayrollBenefits\CalculateEosbRequest;
use App\Http\Resources\HumanCapital\PayrollBenefits\EOSBCalculationResource;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EOSBController extends Controller
{
    use BaseApiController;

    /**
     * Calculate EOSB for an employee
     */
    public function calculate(CalculateEosbRequest $request, $employeeId, CalculateEOSBAction $action): JsonResponse
    {
        $validated = $request->validated();

        try {
            $calculation = $action->execute($employeeId, $validated);
            return $this->successResponse(new EOSBCalculationResource($calculation), 'EOSB calculated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Preview EOSB calculation without saving
     */
    public function preview(CalculateEosbRequest $request, PreviewEOSBCalculationAction $action): JsonResponse
    {
        $validated = $request->validated();

        try {
            $calculation = $action->execute($validated);
            return $this->successResponse(new EOSBCalculationResource($calculation), 'EOSB preview generated');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}
