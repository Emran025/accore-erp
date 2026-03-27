<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\WellnessParticipation;

class CreateWellnessParticipationAction
{
    public function execute(array $data): WellnessParticipation
    {
        $data['enrollment_date'] = now();
        $data['status'] = 'enrolled';
        $data['points'] = 0;
        $data['metrics_data'] = [];

        $participation = WellnessParticipation::create($data);
        return $participation->load('program', 'employee');
    }
}
