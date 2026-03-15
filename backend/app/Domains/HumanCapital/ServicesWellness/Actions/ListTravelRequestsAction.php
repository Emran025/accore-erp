<?php
namespace App\Domains\HumanCapital\ServicesWellness\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\ServicesWellness\Models\TravelRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class ListTravelRequestsAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $query = TravelRequest::with(['employee']);
        if ($this->request->filled('employee_id')) $query->where('employee_id', $this->request->employee_id);
        if ($this->request->filled('status')) $query->where('status', $this->request->status);
        return $this->successResponse($query->orderBy('created_at', 'desc')->paginate(15)->toArray());
    }
}
