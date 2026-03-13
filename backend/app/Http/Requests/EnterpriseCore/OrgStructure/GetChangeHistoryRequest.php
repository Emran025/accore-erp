<?php

namespace App\Http\Requests\EnterpriseCore\OrgStructure;

use Illuminate\Foundation\Http\FormRequest;

class GetChangeHistoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'entity_type' => 'required|string',
            'entity_id'   => 'required|string',
            'limit'       => 'nullable|integer|min:1|max:500',
        ];
    }
}
