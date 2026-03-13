<?php
namespace App\Domains\Finance\BankReconciliation\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\BankReconciliation\Models\BankReconciliation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class ListReconciliationsAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $query = BankReconciliation::with(['bankAccount']);
        if ($this->request->filled('status')) $query->where('status', $this->request->status);
        return $this->successResponse($query->orderBy('reconciliation_date', 'desc')->paginate(15)->toArray());
    }
}
