<?php
namespace App\Domains\Finance\BankReconciliation\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\BankReconciliation\Models\BankReconciliation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class CreateReconciliationAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'bank_account_id' => 'required', 'reconciliation_date' => 'required|date',
            'statement_balance' => 'required|numeric', 'book_balance' => 'required|numeric',
            'items' => 'nullable|array', 'notes' => 'nullable|string',
        ]);
        $validated['status'] = 'draft';
        $validated['difference'] = $validated['statement_balance'] - $validated['book_balance'];
        $validated['created_by'] = auth()->id();
        $reconciliation = BankReconciliation::create($validated);
        return response()->json(array_merge(['success' => true], $reconciliation->toArray()), 201);
    }
}
