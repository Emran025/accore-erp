<?php

namespace App\Http\Requests\EnterpriseCore\OrganizationGovernance;

use Illuminate\Foundation\Http\FormRequest;

class ListMetaTypesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'level_domain' => 'nullable|string',
        ];
    }
}
