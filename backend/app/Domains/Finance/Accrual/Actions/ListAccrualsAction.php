<?php
namespace App\Domains\Finance\Accrual\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\Accrual\Models\AccrualAccounting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class ListAccrualsAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $query = AccrualAccounting::with(['account']);
        if ($this->request->filled('status')) $query->where('status', $this->request->status);
        return $this->successResponse($query->orderBy('accrual_date', 'desc')->paginate(15)->toArray());
    }
}
