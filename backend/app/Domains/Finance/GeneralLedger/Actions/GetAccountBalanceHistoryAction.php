<?php
namespace App\Domains\Finance\GeneralLedger\Actions;

use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\Finance\ChartOfAccounts\Models\ChartOfAccount;
class GetAccountBalanceHistoryAction
{
    public function execute(array $filters): array
    {
        $accountCode = $filters['account_code'] ?? null;
        $accountId = $filters['account_id'] ?? null;
        
        if ($accountId) {
            $account = ChartOfAccount::find($accountId);
        } elseif ($accountCode) {
            $account = ChartOfAccount::where('account_code', $accountCode)->first();
        } else {
            throw new \Exception('account_code or account_id is required', 400);
        }
        
        if (!$account) {
            throw new \Exception('Account not found', 404);
        }

        $startDate = $filters['start_date'] ?? $filters['date_from'] ?? now()->startOfYear()->format('Y-m-d');
        $endDate = $filters['end_date'] ?? $filters['date_to'] ?? now()->format('Y-m-d');
        $interval = $filters['interval'] ?? 'month'; // day, week, month, year

        $entries = GeneralLedger::where('account_id', $account->id)
            ->where('is_closed', false)
            ->whereBetween('voucher_date', [$startDate, $endDate])
            ->orderBy('voucher_date', 'asc')
            ->get();

        $history = [];
        $runningBalance = 0;

        // Group by interval
        $grouped = $entries->groupBy(function ($entry) use ($interval) {
            $date = new \DateTime($entry->voucher_date);
            
            switch ($interval) {
                case 'day':
                    return $date->format('Y-m-d');
                case 'week':
                    return $date->format('Y-W');
                case 'year':
                    return $date->format('Y');
                case 'month':
                default:
                    return $date->format('Y-m');
            }
        });

        foreach ($grouped as $period => $periodEntries) {
            $debits = $periodEntries->where('entry_type', 'DEBIT')->sum('amount');
            $credits = $periodEntries->where('entry_type', 'CREDIT')->sum('amount');

            if (in_array(strtolower($account->account_type), ['asset', 'expense'])) {
                $runningBalance += ($debits - $credits);
            } else {
                $runningBalance += ($credits - $debits);
            }

            $history[] = [
                'period' => $period,
                'debits' => $debits,
                'credits' => $credits,
                'balance' => $runningBalance,
            ];
        }

        return [
            'account' => [
                'code' => $account->account_code,
                'name' => $account->account_name,
                'type' => $account->account_type,
            ],
            'interval' => $interval,
            'history' => $history,
        ];
    }
}
