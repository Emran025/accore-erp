<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class StoreEmployeeDocumentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'document'        => 'required|file|max:10240',
            'document_type'   => 'required|string',
            'document_name'   => 'required|string',
            'document_number' => 'nullable|string',
            'issue_date'      => 'nullable|date',
            'expiration_date' => 'nullable|date',
        ];
    }
}
