<?php

namespace App\Domains\DataIntelligence\Reports\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Domains\EnterpriseCore\IAM\Services\PermissionService;

class GenerateComparativeFinancialReportAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        PermissionService::requirePermission('general_ledger', 'view');
        $currentStart = $this->request->input('current_start', now()->startOfMonth()->format('Y-m-d'));
        $currentEnd = $this->request->input('current_end', now()->format('Y-m-d'));
        $previousStart = $this->request->input('previous_start');
        $previousEnd = $this->request->input('previous_end');

        $currentRevenue = collect($this->getAccountTypeDetails('Revenue', $currentEnd, $currentStart))->sum('balance');
        $currentExpenses = collect($this->getAccountTypeDetails('Expense', $currentEnd, $currentStart))->sum('balance');
        $currentNetProfit = $currentRevenue - $currentExpenses;

        $report = [
            'current_period' => [
                'revenue' => $currentRevenue,
                'expenses' => $currentExpenses,
                'net_profit' => $currentNetProfit,
            ],
            'previous_period' => null,
            'changes' => null,
        ];

        if ($previousStart && $previousEnd) {
            $prevRevenue = collect($this->getAccountTypeDetails('Revenue', $previousEnd, $previousStart))->sum('balance');
            $prevExpenses = collect($this->getAccountTypeDetails('Expense', $previousEnd, $previousStart))->sum('balance');
            $prevNetProfit = $prevRevenue - $prevExpenses;

            $report['previous_period'] = [
                'revenue' => $prevRevenue,
                'expenses' => $prevExpenses,
                'net_profit' => $prevNetProfit,
            ];

            $report['changes'] = [
                'revenue' => $this->calculateChange($currentRevenue, $prevRevenue),
                'expenses' => $this->calculateChange($currentExpenses, $prevExpenses),
                'net_profit' => $this->calculateChange($currentNetProfit, $prevNetProfit),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
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

    private function calculateChange(float $current, float $previous): array
    {
        $amount = $current - $previous;
        $percentage = $previous != 0 ? ($amount / abs($previous)) * 100 : ($amount == 0 ? 0 : 100);

        return [
            'amount' => $amount,
            'percentage' => $percentage,
        ];
    }
}

