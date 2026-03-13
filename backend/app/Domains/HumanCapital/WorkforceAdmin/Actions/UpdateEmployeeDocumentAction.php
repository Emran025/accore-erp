<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;

class UpdateEmployeeDocumentAction
{
    public function execute(int|string $employeeId, int|string $documentId, array $data): array
    {
        $employee = Employee::findOrFail($employeeId);
        $document = $employee->documents()->findOrFail($documentId);

        $document->update($data);

        return $document->toArray();
    }
}
