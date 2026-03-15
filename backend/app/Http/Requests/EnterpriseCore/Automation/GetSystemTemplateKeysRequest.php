<?php

namespace App\Http\Requests\EnterpriseCore\Automation;

use Illuminate\Foundation\Http\FormRequest;

class GetSystemTemplateKeysRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'type' => 'required|string',
        ];
    }
}
