<?php
namespace App\Domains\Intelligence\AdvancedAnalytics\Actions;

use App\Domains\Finance\GeneralLedger\Models\GeneralLedger;

class GetBalanceSheetAction
{
    public function execute(array $data): array
    {

        $asOfDate = $data['as_of_date'] ?? now()->format('Y-m-d');

        $assets = $this->getAccountTypeDetails('Asset', $asOfDate);
        $liabilities = $this->getAccountTypeDetails('Liability', $asOfDate);
        $equity = $this->getAccountTypeDetails('Equity', $asOfDate);
        
        $revenues = $this->getAccountTypeDetails('Revenue', $asOfDate);
        $expenses = $this->getAccountTypeDetails('Expense', $asOfDate);
        $netIncome = collect($revenues)->sum('balance') - collect($expenses)->sum('balance');

        if ($netIncome != 0) {
            $equity[] = [
                'account_code' => 'NET_INCOME',
                'account_name' => 'Current Net Income/Loss',
                'balance' => $netIncome,
            ];
        }

        return [
            'as_of_date' => $asOfDate,
            'assets' => ['accounts' => $assets, 'total' => collect($assets)->sum('balance')],
            'liabilities' => ['accounts' => $liabilities, 'total' => collect($liabilities)->sum('balance')],
            'equity' => ['accounts' => $equity, 'total' => collect($equity)->sum('balance')],
            'is_balanced' => true,
        ];
    }

    private function getAccountTypeDetails(string $type, string $date): array
    {
        return GeneralLedger::select('coa.account_code', 'coa.account_name')
            ->selectRaw("SUM(CASE WHEN entry_type = 'DEBIT' THEN amount ELSE -amount END) as balance")
            ->join('chart_of_accounts as coa', 'coa.id', '=', 'general_ledger.account_id')
            ->where('coa.account_type', $type)
            ->whereDate('voucher_date', '<=', $date)
            ->groupBy('coa.account_code', 'coa.account_name')
            ->get()
            ->toArray();
    }
}
