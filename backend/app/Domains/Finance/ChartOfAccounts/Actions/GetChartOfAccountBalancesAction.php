<?php

namespace App\Domains\Finance\ChartOfAccounts\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\ChartOfAccounts\Models\ChartOfAccount;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetChartOfAccountBalancesAction
{
    public function __construct(
        private readonly LedgerService $ledgerService
    ) {}

    public function execute(array $filters): array
    {
        $asOfDate = $filters['as_of_date'] ?? null;
        $accountType = $filters['account_type'] ?? null;

        $query = ChartOfAccount::where('is_active', true);

        if ($accountType) {
            $query->where('account_type', $accountType);
        }

        $accounts = $query->orderBy('account_code')->get();

        $balances = $accounts->map(function ($account) use ($asOfDate) {
            $balance = $this->ledgerService->getAccountBalance($account->account_code, $asOfDate);
            
            return [
                'account_code' => $account->account_code,
                'account_name' => $account->account_name,
                'account_type' => $account->account_type,
                'balance' => $balance,
            ];
        });

        // Calculate totals by type
        $totals = [
            'Asset' => 0,
            'Liability' => 0,
            'Equity' => 0,
            'Revenue' => 0,
            'Expense' => 0,
        ];

        foreach ($balances as $account) {
            $totals[$account['account_type']] += $account['balance'];
        }

        return [
            'as_of_date' => $asOfDate ?? now()->format('Y-m-d'),
            'accounts' => $balances,
            'totals' => $totals,
        ];
    }
}
