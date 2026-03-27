<?php

namespace App\Domains\EnterpriseCore\Automation\Actions;

use App\Domains\Finance\Treasury\Models\RecurringTransaction;


class UpdateRecurringTransactionAction
{
    public function execute(int $id, array $data): RecurringTransaction
    {
        $template = RecurringTransaction::findOrFail($id);
        $template->update($data);

        return $template->fresh();
    }
}

