<?php

namespace App\Http\Requests\HumanCapital\DocumentManagement;

use Illuminate\Foundation\Http\FormRequest;

class RenderDocumentTemplateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_id'   => 'required|exists:employees,id',
            'custom_fields' => 'nullable|array',
            'language'      => 'nullable|string|in:ar,en',
        ];
    }
}
