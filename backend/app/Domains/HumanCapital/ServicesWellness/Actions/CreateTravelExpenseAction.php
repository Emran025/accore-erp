<?php

namespace App\Domains\HumanCapital\ServicesWellness\Actions;

use App\Domains\HumanCapital\ServicesWellness\Models\TravelExpense;

class CreateTravelExpenseAction
{
    public function execute(array $data): TravelExpense
    {
        $data['amount_in_base_currency'] = $data['amount'] * ($data['exchange_rate'] ?? 1);
        $data['status'] = 'pending';
        $data['is_duplicate'] = false;

        return TravelExpense::create($data);
    }
}
