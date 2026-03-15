<?php

namespace App\Http\Requests\EnterpriseCore\OrganizationGovernance;

use Illuminate\Foundation\Http\FormRequest;

class ListLinksRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'source_type' => 'nullable|string',
            'target_type' => 'nullable|string',
            'link_type'   => 'nullable|string',
            'active_only' => 'nullable|boolean',
        ];
    }
}
