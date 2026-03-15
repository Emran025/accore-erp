<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\PayrollBenefits;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\PayrollBenefits\Actions\CalculateEOSBAction;
use App\Domains\HumanCapital\PayrollBenefits\Actions\PreviewEOSBCalculationAction;
use App\Http\Requests\HumanCapital\PayrollBenefits\CalculateEosbRequest;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class EOSBController extends Controller
{
    use BaseApiController;

    /**
     * Calculate EOSB for an employee
     */
    public function calculate(CalculateEosbRequest $request, $employeeId, CalculateEOSBAction $action)
    {
        $validated = $request->validated();

        try {
            $calculation = $action->execute($employeeId, $validated);
            return response()->json($calculation);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Preview EOSB calculation without saving
     */
    public function preview(CalculateEosbRequest $request, PreviewEOSBCalculationAction $action)
    {
        $validated = $request->validated();

        try {
            $calculation = $action->execute($validated);
            return response()->json($calculation);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
