<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\TravelRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class CreateTravelRequestAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'employee_id' => 'required|exists:employees,id', 'destination' => 'required|string|max:255',
            'purpose' => 'required|string', 'departure_date' => 'required|date',
            'return_date' => 'required|date|after:departure_date', 'estimated_cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);
        $validated['request_number'] = 'TR-' . date('Ymd') . '-' . str_pad(TravelRequest::count() + 1, 4, '0', STR_PAD_LEFT);
        $validated['status'] = 'draft';
        $travelRequest = TravelRequest::create($validated);
        return response()->json(array_merge(['success' => true], $travelRequest->load('employee')->toArray()), 201);
    }
}
