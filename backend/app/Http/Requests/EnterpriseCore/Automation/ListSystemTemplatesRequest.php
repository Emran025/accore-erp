<?php

namespace App\Http\Requests\EnterpriseCore\Automation;

use Illuminate\Foundation\Http\FormRequest;

class ListSystemTemplatesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type'   => 'nullable|string',
            'search' => 'nullable|string',
        ];
    }
}
