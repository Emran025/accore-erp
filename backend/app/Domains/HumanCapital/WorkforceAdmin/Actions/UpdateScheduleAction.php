<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\TimeProductivity\Models\WorkforceSchedule;

class UpdateScheduleAction
{
    public function execute(int $id, array $data): WorkforceSchedule
    {
        $schedule = WorkforceSchedule::findOrFail($id);
        $schedule->update($data);

        return $schedule->load('department', 'shifts.employee');
    }
}
