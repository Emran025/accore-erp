<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmployeeDocumentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'document_type'   => 'sometimes|string',
            'document_name'   => 'sometimes|string',
            'document_number' => 'nullable|string',
            'issue_date'      => 'nullable|date',
            'expiration_date' => 'nullable|date',
        ];
    }
}
