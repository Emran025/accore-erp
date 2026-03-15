<?php

namespace App\Http\Requests\EnterpriseCore\Automation;

use Illuminate\Foundation\Http\FormRequest;

class RenderSystemTemplateRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'context'   => 'required|array',
            'language'  => 'nullable|string|in:ar,en',
        ];
    }
}
