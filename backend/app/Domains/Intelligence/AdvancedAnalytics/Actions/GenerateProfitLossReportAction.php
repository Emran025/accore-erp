<?php

namespace App\Domains\Intelligence\AdvancedAnalytics\Actions;

use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use Illuminate\Support\Facades\DB;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class GenerateProfitLossReportAction
{
    public function execute(array $data): array
    {
        PermissionService::requirePermission('general_ledger', 'view');

        $startDate = $data['start_date'] ?? now()->startOfMonth()->format('Y-m-d');
        $endDate = $data['end_date'] ?? now()->format('Y-m-d');

        $revenues = $this->getAccountTypeDetails('Revenue', $endDate, $startDate);
        $totalRevenue = collect($revenues)->sum('balance');

        $expenses = $this->getAccountTypeDetails('Expense', $endDate, $startDate);
        $totalExpenses = collect($expenses)->sum('balance');

        $netIncome = $totalRevenue - $totalExpenses;

        return [
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'data' => [
                'revenue' => [
                    'accounts' => $revenues,
                    'total' => $totalRevenue,
                ],
                'expenses' => [
                    'accounts' => $expenses,
                    'total' => $totalExpenses,
                ],
                'net_income' => $netIncome,
            ],
        ];
    }

    private function getAccountTypeDetails(string $accountType, string $asOfDate, ?string $startDate = null): array
    {
        $balances = GeneralLedger::select(
                'chart_of_accounts.account_code',
                'chart_of_accounts.account_name',
                DB::raw("SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END) as debits"),
                DB::raw("SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) as credits")
            )
            ->join('chart_of_accounts', 'chart_of_accounts.id', '=', 'general_ledger.account_id')
            ->whereIn('chart_of_accounts.account_type', [$accountType, strtolower($accountType)])
            ->where('chart_of_accounts.is_active', true)
            ->where('general_ledger.is_closed', 0)
            ->whereDate('general_ledger.voucher_date', '<=', $asOfDate);

        if ($startDate) {
            $balances->whereDate('general_ledger.voucher_date', '>=', $startDate);
        }

        $results = $balances
            ->groupBy('chart_of_accounts.account_code', 'chart_of_accounts.account_name')
            ->orderBy('chart_of_accounts.account_code')
            ->get();

        $details = [];
        foreach ($results as $row) {
            $debits = (float) $row->debits;
            $credits = (float) $row->credits;

            $balance = 0;
            $type = strtolower($accountType);
            if (in_array($type, ['asset', 'expense'])) {
                $balance = $debits - $credits;
            } else {
                $balance = $credits - $debits;
            }

            if ($balance != 0 || !$startDate) {
                $details[] = [
                    'account_code' => $row->account_code,
                    'account_name' => $row->account_name,
                    'balance' => $balance,
                ];
            }
        }

        return $details;
    }
}

