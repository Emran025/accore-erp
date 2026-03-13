<?php

namespace App\Http\Requests\HumanCapital\DocumentManagement;

use Illuminate\Foundation\Http\FormRequest;

class StoreDocumentTemplateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'template_key'     => 'required|string|max:50|unique:document_templates,template_key',
            'template_name_ar' => 'required|string|max:255',
            'template_name_en' => 'nullable|string|max:255',
            'template_type'    => 'required|string', // Additional validation done in controller with $this->hrTypes
            'body_html'        => 'required|string',
            'editable_fields'  => 'nullable|array',
            'description'      => 'nullable|string|max:500',
        ];
    }
}
