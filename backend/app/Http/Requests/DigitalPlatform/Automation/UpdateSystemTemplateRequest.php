<?php

namespace App\Http\Requests\DigitalPlatform\Automation;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSystemTemplateRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'template_name_ar' => 'string|max:255',
            'template_name_en' => 'nullable|string|max:255',
            'template_type'    => 'string',
            'body_html'        => 'string',
            'editable_fields'  => 'nullable|array',
            'description'      => 'nullable|string|max:500',
            'is_active'        => 'boolean',
        ];
    }
}
