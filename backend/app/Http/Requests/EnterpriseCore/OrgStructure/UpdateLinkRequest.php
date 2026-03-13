<?php

namespace App\Http\Requests\EnterpriseCore\OrgStructure;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'link_type'  => 'nullable|string|max:32',
            'priority'   => 'nullable|integer|min:0',
            'valid_from' => 'nullable|date',
            'valid_to'   => 'nullable|date',
        ];
    }
}
