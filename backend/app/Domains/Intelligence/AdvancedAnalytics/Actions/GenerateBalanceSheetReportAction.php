<?php

namespace App\Domains\Intelligence\AdvancedAnalytics\Actions;

use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;

use Illuminate\Support\Facades\DB;

class GenerateBalanceSheetReportAction
{
    public function __construct(
        private readonly LedgerService $ledgerService
    ) {}

    public function execute(array $data): array
    {

        $asOfDate = $data['as_of_date'] ?? now()->format('Y-m-d');

        $assets = $this->getAccountTypeDetails('Asset', $asOfDate);
        $totalAssets = collect($assets)->sum('balance');

        $liabilities = $this->getAccountTypeDetails('Liability', $asOfDate);
        $totalLiabilities = collect($liabilities)->sum('balance');

        $equity = $this->getAccountTypeDetails('Equity', $asOfDate);

        $revenues = $this->getAccountTypeDetails('Revenue', $asOfDate);
        $expenses = $this->getAccountTypeDetails('Expense', $asOfDate);

        $totalRevenue = collect($revenues)->sum('balance');
        $totalExpenses = collect($expenses)->sum('balance');
        $netIncome = $totalRevenue - $totalExpenses;

        if ($netIncome != 0) {
            $equity[] = [
                'account_code' => 'NET_INCOME_VIRTUAL',
                'account_name' => 'Current Net Income / (Loss) - صافي الربح/الخسارة للفترة',
                'balance' => $netIncome,
            ];
        }

        $totalEquity = collect($equity)->sum('balance');

        return [
            'as_of_date' => $asOfDate,
            'data' => [
                'assets' => [
                    'accounts' => $assets,
                    'total' => $totalAssets,
                ],
                'liabilities' => [
                    'accounts' => $liabilities,
                    'total' => $totalLiabilities,
                ],
                'equity' => [
                    'accounts' => $equity,
                    'total' => $totalEquity,
                ],
                'total_liabilities_and_equity' => $totalLiabilities + $totalEquity,
                'is_balanced' => abs($totalAssets - ($totalLiabilities + $totalEquity)) < 0.01,
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

