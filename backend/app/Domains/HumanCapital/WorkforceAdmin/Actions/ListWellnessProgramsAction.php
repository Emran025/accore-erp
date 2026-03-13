<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\WellnessProgram;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class ListWellnessProgramsAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $query = WellnessProgram::with(['participations']);
        if ($this->request->filled('program_type')) $query->where('program_type', $this->request->program_type);
        if ($this->request->filled('is_active')) $query->where('is_active', $this->request->is_active === 'true');
        return $this->successResponse($query->orderBy('start_date', 'desc')->paginate(15)->toArray());
    }
}
