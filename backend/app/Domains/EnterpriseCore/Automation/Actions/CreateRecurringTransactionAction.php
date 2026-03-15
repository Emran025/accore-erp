<?php

namespace App\Domains\EnterpriseCore\Automation\Actions;

use App\Domains\Finance\Treasury\Models\RecurringTransaction;

class CreateRecurringTransactionAction
{
    public function execute(array $data): array
    {
        $template = RecurringTransaction::create($data);

        return ['id' => $template->id];
    }
}

