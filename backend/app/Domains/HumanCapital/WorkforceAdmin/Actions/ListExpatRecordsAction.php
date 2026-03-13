<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\ExpatManagement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListExpatRecordsAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $query = ExpatManagement::with(['employee', 'documents']);
        
        if ($this->request->filled('employee_id')) {
            $query->where('employee_id', $this->request->employee_id);
        }
        
        if ($this->request->filled('search')) {
            $search = $this->request->search;
            $query->whereHas('employee', function($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%");
            });
        }
        
        return $this->successResponse($query->paginate(15)->toArray());
    }
}
