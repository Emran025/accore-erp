<?php

namespace App\Domains\EnterpriseCore\Automation\Actions;

use App\Domains\Finance\Treasury\Models\RecurringTransaction;

class CreateRecurringTransactionAction
{
    public function execute(array $data): RecurringTransaction
    {
        return RecurringTransaction::create($data);
    }
}

