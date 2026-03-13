<?php
namespace App\Domains\Finance\Expenses\Actions;
use App\Domains\Finance\Expenses\Models\Expense;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class ListExpensesAction
{
    public function execute(array $filters): array
    {
        PermissionService::requirePermission('expenses', 'view');

        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 20)));

        $query = Expense::with(['user', 'supplier']);

        $total = $query->count();
        $expenses = $query->orderBy('expense_date', 'desc')
            ->skip(($page - 1) * $perPage)
            ->take($perPage)
            ->get()
            ->map(function ($expense) {
                // Derive amount from GL (single source of truth)
                $glAmount = GeneralLedger::where('voucher_number', $expense->voucher_number)
                    ->where('entry_type', 'DEBIT')
                    ->sum('amount');
                $expense->setAttribute('gl_amount', (float) $glAmount);
                return $expense;
            });

        return [
            'data' => $expenses->toArray(),
            'total' => $total,
            'current_page' => $page,
            'per_page' => $perPage,
        ];
    }
}
