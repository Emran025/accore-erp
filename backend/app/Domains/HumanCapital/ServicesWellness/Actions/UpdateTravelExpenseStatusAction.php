<?php

namespace App\Domains\HumanCapital\ServicesWellness\Actions;

use App\Domains\HumanCapital\ServicesWellness\Models\TravelExpense;

class UpdateTravelExpenseStatusAction
{
    public function execute(TravelExpense $expense, array $data): TravelExpense
    {
        if (in_array($data['status'] ?? null, ['approved', 'rejected'])) {
            $data['approved_by'] = auth()->id();
        }

        $expense->update($data);
        return $expense;
    }
}
