<?php

namespace App\Domains\HumanCapital\ServicesWellness\Actions;

use App\Domains\HumanCapital\ServicesWellness\Models\EmployeeHealthRecord;

class CreateHealthRecordAction
{
    public function execute(array $data): EmployeeHealthRecord
    {
        return EmployeeHealthRecord::create($data)->load('employee');
    }
}
