<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\TravelRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class UpdateTravelRequestStatusAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $id) {}
    public function __invoke(): JsonResponse
    {
        $travelRequest = TravelRequest::findOrFail($this->id);
        $validated = $this->request->validate([
            'status' => 'required|in:draft,pending_approval,approved,rejected,cancelled,completed',
            'rejection_reason' => 'nullable|string|required_if:status,rejected',
        ]);
        if ($this->request->status === 'approved') {
            $validated['approved_by'] = auth()->id();
            $validated['approved_at'] = now();
        }
        $travelRequest->update($validated);
        return $this->successResponse($travelRequest->load('employee')->toArray());
    }
}
