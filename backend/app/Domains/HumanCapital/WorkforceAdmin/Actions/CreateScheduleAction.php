<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\HumanCapital\TimeProductivity\Models\WorkforceSchedule;

class CreateScheduleAction
{
    public function execute(array $data): WorkforceSchedule
    {
        $data['status'] = 'draft';
        $data['created_by'] = auth()->id();
        
        return WorkforceSchedule::create($data)->load('department');
    }
}
