<?php

namespace App\Domains\HumanCapital\Payroll\Actions;

use App\Domains\HumanCapital\Payroll\Models\PayrollTransaction;

class GetPayrollItemTransactionsAction
{
    public function execute(int|string $itemId): array
    {
        $transactions = PayrollTransaction::where('payroll_item_id', $itemId)
            ->orderBy('transaction_date', 'desc')
            ->get();
            
        return $transactions->toArray();
    }
}
