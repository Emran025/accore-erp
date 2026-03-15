<?php

namespace App\Http\Requests\EnterpriseCore\Automation;

use Illuminate\Foundation\Http\FormRequest;

class StoreSystemTemplateRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'template_key'     => 'required|string|max:50|unique:document_templates,template_key',
            'template_name_ar' => 'required|string|max:255',
            'template_name_en' => 'nullable|string|max:255',
            'template_type'    => 'required|string',
            'body_html'        => 'required|string',
            'editable_fields'  => 'nullable|array',
            'description'      => 'nullable|string|max:500',
        ];
    }
}
