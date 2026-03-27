<?php

namespace App\Domains\HumanCapital\PayrollBenefits\Actions;

use App\Domains\HumanCapital\PayrollBenefits\Models\PayrollCycle;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
class ListPayrollCyclesAction
{
    public function execute(): LengthAwarePaginator
    {
        return PayrollCycle::with(['current_approver', 'creator'])->orderBy('created_at', 'desc')->paginate(15);
    }
}
