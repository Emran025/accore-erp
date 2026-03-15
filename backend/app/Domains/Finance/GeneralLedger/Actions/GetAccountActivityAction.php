<?php
namespace App\Domains\Finance\GeneralLedger\Actions;
use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;
use App\Domains\Finance\GeneralLedger\Models\ChartOfAccount;
use Illuminate\Http\JsonResponse;
class GetAccountActivityAction
{
    public function execute(array $filters): array
    {
        $startDate = $filters['start_date'] ?? now()->startOfMonth()->format('Y-m-d');
        $endDate = $filters['end_date'] ?? now()->format('Y-m-d');

        $accounts = ChartOfAccount::where('is_active', true)
            ->orderBy('account_code')
            ->get();

        $activity = [];

        foreach ($accounts as $account) {
            $totals = GeneralLedger::where('account_id', $account->id)
                ->where('is_closed', false)
                ->whereBetween('voucher_date', [$startDate, $endDate])
                ->selectRaw('
                    SUM(CASE WHEN entry_type = "DEBIT" THEN amount ELSE 0 END) as debits,
                    SUM(CASE WHEN entry_type = "CREDIT" THEN amount ELSE 0 END) as credits,
                    COUNT(*) as transaction_count
                ')
                ->first();

            $debits = (float)($totals->debits ?? 0);
            $credits = (float)($totals->credits ?? 0);
            $count = (int)($totals->transaction_count ?? 0);

            if ($count > 0) {
                $activity[] = [
                    'account_code' => $account->account_code,
                    'account_name' => $account->account_name,
                    'account_type' => $account->account_type,
                    'debits' => $debits,
                    'credits' => $credits,
                    'net_change' => $debits - $credits,
                    'transaction_count' => $count,
                ];
            }
        }

        return [
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'data' => $activity,
        ];
    }
}
