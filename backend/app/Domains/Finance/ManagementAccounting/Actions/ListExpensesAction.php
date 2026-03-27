<?php
namespace App\Domains\Finance\ManagementAccounting\Actions;
use App\Domains\Finance\ManagementAccounting\Models\Expense;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;
use Illuminate\Pagination\LengthAwarePaginator;
class ListExpensesAction
{
    public function execute(array $filters): LengthAwarePaginator
    {
        PermissionService::requirePermission('expenses', 'view');

        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 20)));

        $query = Expense::with(['user', 'supplier']);

        $paginator = $query->orderBy('expense_date', 'desc')->paginate($perPage);

        $paginator->getCollection()->map(function ($expense) {
            $glAmount = GeneralLedger::where('voucher_number', $expense->voucher_number)
                ->where('entry_type', 'DEBIT')
                ->sum('amount');
            $expense->setAttribute('gl_amount', (float) $glAmount);
            return $expense;
        });

        return $paginator;
    }
}
