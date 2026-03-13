<?php

namespace App\Http\Requests\EnterpriseCore\OrgStructure;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code'       => 'sometimes|string|max:32',
            'attributes' => 'nullable|array',
            'status'     => 'nullable|in:active,inactive,archived',
            'valid_from' => 'nullable|date',
            'valid_to'   => 'nullable|date|after_or_equal:valid_from',
        ];
    }
}
