<?php

namespace App\Domains\Intelligence\AdvancedAnalytics\Actions;

use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use Illuminate\Support\Facades\DB;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class GenerateCashFlowReportAction
{
    public function __construct(
        private readonly LedgerService $ledgerService
    ) {}

    public function execute(array $data): array
    {
        PermissionService::requirePermission('general_ledger', 'view');

        $startDate = $data['start_date'] ?? now()->startOfMonth()->format('Y-m-d');
        $endDate = $data['end_date'] ?? now()->format('Y-m-d');

        $cashAccount = ChartOfAccount::where('account_code', 'like', '1110%')
            ->orWhere('account_name', 'like', '%Cash%')
            ->orWhere('account_name', 'like', '%النقدية%')
            ->first();

        if (!$cashAccount) {
            $cashAccount = ChartOfAccount::whereIn('account_type', ['Asset', 'asset'])
                ->where('account_name', 'like', '%cash%')
                ->first();

            if (!$cashAccount) {
                throw new \Exception('Cash account not found', 404);
            }
        }

        $netIncome = $this->getNetIncome($startDate, $endDate);
        $investing = $this->getInvestingActivities($startDate, $endDate);
        $financing = $this->getFinancingActivities($startDate, $endDate);

        $netChange = $netIncome + $investing + $financing;

        $beginningCash = $this->ledgerService->getAccountBalance($cashAccount->account_code, $startDate);
        $endingCash = $this->ledgerService->getAccountBalance($cashAccount->account_code, $endDate);

        return [
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'data' => [
                'operating_activities' => [
                    'net_income' => $netIncome,
                ],
                'investing_activities' => [
                    'total' => $investing,
                ],
                'financing_activities' => [
                    'total' => $financing,
                ],
                'net_change_in_cash' => $netChange,
                'beginning_cash' => $beginningCash,
                'ending_cash' => $endingCash,
            ],
        ];
    }

    private function getNetIncome(string $startDate, string $endDate): float
    {
        $revenues = $this->getAccountTypeDetails('Revenue', $endDate, $startDate);
        $totalRevenue = collect($revenues)->sum('balance');

        $expenses = $this->getAccountTypeDetails('Expense', $endDate, $startDate);
        $totalExpenses = collect($expenses)->sum('balance');

        return $totalRevenue - $totalExpenses;
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

    private function getInvestingActivities(string $startDate, string $endDate): float
    {
        $accounts = ChartOfAccount::whereIn('account_type', ['Asset', 'asset'])
            ->where('is_active', true)
            ->get();

        $total = 0;

        foreach ($accounts as $account) {
            if (str_starts_with($account->account_code, '11') || str_starts_with($account->account_code, '12')) {
                continue;
            }

            $change = GeneralLedger::where('account_id', $account->id)
                ->whereDate('voucher_date', '>=', $startDate)
                ->whereDate('voucher_date', '<=', $endDate)
                ->selectRaw("
                    SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) -
                    SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END) as net_change
                ")
                ->value('net_change') ?? 0;

            $total += (float) $change;
        }

        return $total;
    }

    private function getFinancingActivities(string $startDate, string $endDate): float
    {
        $accounts = ChartOfAccount::whereIn('account_type', ['Liability', 'Equity', 'liability', 'equity'])
            ->where('is_active', true)
            ->get();

        $total = 0;

        foreach ($accounts as $account) {
            if (str_starts_with($account->account_code, '21')) {
                continue;
            }

            if ($account->account_name === 'Retained Earnings' || str_contains($account->account_name, 'Net Income')) {
                continue;
            }

            $change = GeneralLedger::where('account_id', $account->id)
                ->whereDate('voucher_date', '>=', $startDate)
                ->whereDate('voucher_date', '<=', $endDate)
                ->selectRaw("
                    SUM(CASE WHEN entry_type = 'CREDIT' THEN amount ELSE 0 END) -
                    SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE 0 END) as net_change
                ")
                ->value('net_change') ?? 0;

            $total += (float) $change;
        }

        return $total;
    }
}

