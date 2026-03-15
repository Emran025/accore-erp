<?php

namespace App\Domains\EnterpriseCore\Automation\Actions;

use App\Domains\Finance\Treasury\Models\RecurringTransaction;

class DeleteRecurringTransactionAction
{
    public function execute(int $id): void
    {
        $template = RecurringTransaction::findOrFail($id);
        $template->delete();
    }
}

