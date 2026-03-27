<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\WellnessParticipation;

class UpdateWellnessParticipationAction
{
    public function execute(int|string $id, array $data): WellnessParticipation
    {
        $participation = WellnessParticipation::findOrFail($id);
        
        $participation->update($data);
        return $participation->load('program', 'employee');
    }
}
