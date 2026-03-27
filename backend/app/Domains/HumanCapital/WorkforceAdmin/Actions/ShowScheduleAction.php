<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\TimeProductivity\Models\WorkforceSchedule;

class ShowScheduleAction
{
    public function execute(int $id): WorkforceSchedule
    {
        return WorkforceSchedule::with(['department', 'shifts.employee'])->findOrFail($id);
    }
}
