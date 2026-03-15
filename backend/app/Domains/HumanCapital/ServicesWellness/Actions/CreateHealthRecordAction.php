<?php

namespace App\Domains\HumanCapital\ServicesWellness\Actions;

use App\Domains\HumanCapital\ServicesWellness\Models\EmployeeHealthRecord;

class CreateHealthRecordAction
{
    public function execute(array $data): array
    {
        $record = EmployeeHealthRecord::create($data);

        return $record->load('employee')->toArray();
    }
}
