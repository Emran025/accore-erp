<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\ExpatManagement;

class CreateExpatRecordAction
{
    public function execute(array $data): ExpatManagement
    {
        if (!isset($data['created_by'])) {
            $data['created_by'] = auth()->id();
        }

        $expat = ExpatManagement::create($data);
        return $expat->load('employee');
    }
}
