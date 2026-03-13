<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;
use Illuminate\Support\Facades\Storage;

class DeleteEmployeeDocumentAction
{
    public function execute(int|string $employeeId, int|string $documentId): void
    {
        $employee = Employee::findOrFail($employeeId);
        $document = $employee->documents()->findOrFail($documentId);

        if (Storage::exists($document->file_path)) {
            Storage::delete($document->file_path);
        }

        $document->delete();
    }
}
