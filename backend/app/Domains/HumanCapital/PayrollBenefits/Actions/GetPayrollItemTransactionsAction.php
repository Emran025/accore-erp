<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollTransaction;

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
