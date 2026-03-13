<?php

namespace App\Domains\Finance\ChartOfAccounts\Actions;

use App\Domains\Finance\ChartOfAccounts\Models\ChartOfAccount;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class ListChartOfAccountsAction
{
    public function __construct(
        private readonly LedgerService $ledgerService
    ) {}

    public function execute(array $filters): array
    {
        PermissionService::requirePermission('chart_of_accounts', 'view');
        $search = $filters['search'] ?? null;

        $query = ChartOfAccount::with('parent');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('account_code', 'like', "%$search%")
                  ->orWhere('account_name', 'like', "%$search%");
            });
        }

        $accounts = $query->orderBy('account_code')->get();

        $mappedAccounts = $accounts->map(function ($account) {
            return [
                'id' => $account->id,
                'code' => $account->account_code,
                'name' => $account->account_name,
                'type' => strtolower($account->account_type),
                'parent_id' => $account->parent_id,
                'parent_name' => $account->parent?->account_name,
                'balance' => $this->ledgerService->getAccountBalance($account->account_code),
                'is_active' => $account->is_active,
                'description' => $account->description,
            ];
        });

        return ['accounts' => $mappedAccounts];
    }
}
