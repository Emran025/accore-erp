<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\Manufacturing\Models\QaCompliance;
use Illuminate\Http\JsonResponse;
class ShowComplianceAction extends Action
{
    public function __construct(private readonly int $id) {}
    public function __invoke(): JsonResponse
    {
        $compliance = QaCompliance::with(['employee', 'capas'])->findOrFail($this->id);
        return $this->successResponse($compliance->toArray());
    }
}
