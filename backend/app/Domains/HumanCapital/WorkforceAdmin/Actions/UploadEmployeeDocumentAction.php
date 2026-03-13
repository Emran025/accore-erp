<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;
use Illuminate\Http\UploadedFile;

class UploadEmployeeDocumentAction
{
    public function execute(int|string $employeeId, array $data, UploadedFile $file): array
    {
        $employee = Employee::findOrFail($employeeId);
        $path = $file->store("employees/{$employeeId}/documents");

        $document = $employee->documents()->create([
            'document_type'   => $data['document_type'],
            'document_name'   => $data['document_name'],
            'document_number' => $data['document_number'] ?? null,
            'issue_date'      => $data['issue_date'] ?? null,
            'expiration_date' => $data['expiration_date'] ?? null,
            'file_path'       => $path,
            'mime_type'       => $file->getMimeType(),
            'file_size'       => $file->getSize(),
            'uploaded_by'     => auth()->id(),
        ]);

        return $document->toArray();
    }
}
