<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\WellnessParticipation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class UpdateWellnessParticipationAction extends Action
{
    public function __construct(private readonly Request $request, private readonly int $id) {}
    public function __invoke(): JsonResponse
    {
        $participation = WellnessParticipation::findOrFail($this->id);
        $validated = $this->request->validate([
            'metrics_data' => 'nullable|array', 'points' => 'nullable|integer|min:0',
            'status' => 'in:enrolled,active,completed,dropped', 'notes' => 'nullable|string',
        ]);
        $participation->update($validated);
        return $this->successResponse($participation->load('program', 'employee')->toArray());
    }
}
