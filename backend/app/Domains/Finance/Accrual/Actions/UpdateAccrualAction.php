<?php
namespace App\Domains\Finance\Accrual\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\Accrual\Models\AccrualAccounting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class UpdateAccrualAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate(['id' => 'required|exists:accrual_accounting,id', 'status' => 'in:pending,posted,reversed', 'notes' => 'nullable|string']);
        $accrual = AccrualAccounting::findOrFail($validated['id']);
        $accrual->update($validated);
        return $this->successResponse($accrual->toArray());
    }
}
