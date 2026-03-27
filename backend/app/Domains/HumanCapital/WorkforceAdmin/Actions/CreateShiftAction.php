<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\TimeProductivity\Models\ScheduleShift;
use Carbon\Carbon;
class CreateShiftAction
{
    public function execute(int $scheduleId, array $data): ScheduleShift
    {
        $start = Carbon::parse($data['shift_date'] . ' ' . $data['start_time']);
        $end = Carbon::parse($data['shift_date'] . ' ' . $data['end_time']);
        
        $data['schedule_id'] = $scheduleId;
        $data['hours'] = $start->diffInHours($end);
        $data['status'] = 'scheduled';
        
        return ScheduleShift::create($data)->load('employee');
    }
}
