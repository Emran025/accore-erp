<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\EmployeeHealthRecord;

class CreateHealthRecordAction
{
    public function execute(array $data): array
    {
        $record = EmployeeHealthRecord::create($data);

        return $record->load('employee')->toArray();
    }
}
