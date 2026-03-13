<?php
namespace App\Domains\Finance\Accrual\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\Accrual\Models\AccrualAccounting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
class CreateAccrualAction extends Action
{
    public function __construct(private readonly Request $request) {}
    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'account_id' => 'required|exists:chart_of_accounts,id', 'accrual_date' => 'required|date',
            'amount' => 'required|numeric|min:0.01', 'description' => 'nullable|string',
            'reversal_date' => 'nullable|date|after:accrual_date', 'is_recurring' => 'boolean',
        ]);
        $validated['status'] = 'pending';
        $validated['created_by'] = auth()->id();
        $accrual = AccrualAccounting::create($validated);
        return response()->json(array_merge(['success' => true], $accrual->toArray()), 201);
    }
}
