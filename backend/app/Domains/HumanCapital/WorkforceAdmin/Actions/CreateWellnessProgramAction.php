<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\WellnessProgram;

class CreateWellnessProgramAction
{
    public function execute(array $data): WellnessProgram
    {
        $data['is_active'] = true;
        
        if (!isset($data['created_by'])) {
            $data['created_by'] = auth()->id();
        }

        return WellnessProgram::create($data);
    }
}
