<?php
namespace App\Domains\Finance\BankReconciliation\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\BankReconciliation\Models\BankReconciliation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class UpdateReconciliationAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate(['id' => 'required|exists:bank_reconciliations,id', 'status' => 'in:draft,reconciled,finalized', 'notes' => 'nullable|string']);
        $reconciliation = BankReconciliation::findOrFail($validated['id']);
        $reconciliation->update($validated);
        return $this->successResponse($reconciliation->toArray());
    }
}
