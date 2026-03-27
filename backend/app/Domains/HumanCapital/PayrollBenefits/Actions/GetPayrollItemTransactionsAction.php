<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollTransaction;
use Illuminate\Database\Eloquent\Collection;
class GetPayrollItemTransactionsAction
{
    public function execute(int|string $itemId): Collection
    {
        return PayrollTransaction::where('payroll_item_id', $itemId)
            ->orderBy('transaction_date', 'desc')
            ->get();
    }
}
