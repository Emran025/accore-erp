<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\Payroll;

use App\Http\Controllers\Controller;
use App\Domains\HumanCapital\Payroll\Actions\CalculateEOSBAction;
use App\Domains\HumanCapital\Payroll\Actions\PreviewEOSBCalculationAction;
use App\Http\Requests\HumanCapital\Payroll\CalculateEosbRequest;
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
