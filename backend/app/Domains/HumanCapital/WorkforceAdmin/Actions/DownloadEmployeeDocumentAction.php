<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Collection;

class DownloadEmployeeDocumentAction
{
    public function execute(int $employeeId, int $documentId): Collection
    {
        $employee = Employee::findOrFail($employeeId);
        $document = $employee->documents()->findOrFail($documentId);

        if (!Storage::exists($document->file_path)) {
            throw new \Exception('File not found', 404);
        }

        return collect([
            'file_path'     => $document->file_path,
            'document_name' => $document->document_name,
        ]);
    }
}
