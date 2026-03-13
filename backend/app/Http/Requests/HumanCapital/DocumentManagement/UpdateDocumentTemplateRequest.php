<?php

namespace App\Http\Requests\HumanCapital\DocumentManagement;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDocumentTemplateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'template_name_ar' => 'sometimes|string|max:255',
            'template_name_en' => 'nullable|string|max:255',
            'template_type'    => 'sometimes|string', // Validation happens in controller against $hrTypes
            'body_html'        => 'sometimes|string',
            'editable_fields'  => 'nullable|array',
            'description'      => 'nullable|string|max:500',
            'is_active'        => 'sometimes|boolean',
        ];
    }
}
