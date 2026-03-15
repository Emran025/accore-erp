<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\HRCompliance\Models\PulseSurvey;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class ListSurveysAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $query = PulseSurvey::with(['responses']);
        if ($this->request->filled('survey_type')) $query->where('survey_type', $this->request->survey_type);
        if ($this->request->filled('is_active')) $query->where('is_active', $this->request->is_active === 'true');
        return $this->successResponse($query->orderBy('created_at', 'desc')->paginate(15)->toArray());
    }
}
