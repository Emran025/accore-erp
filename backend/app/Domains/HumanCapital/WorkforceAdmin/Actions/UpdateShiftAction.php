<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\TimeProductivity\Models\ScheduleShift;

class UpdateShiftAction
{
    public function execute(int $scheduleId, int|string $shiftId, array $data): ScheduleShift
    {
        $shift = ScheduleShift::where('schedule_id', $scheduleId)->findOrFail($shiftId);
        $shift->update($data);
        
        return $shift->fresh('employee');
    }
}
