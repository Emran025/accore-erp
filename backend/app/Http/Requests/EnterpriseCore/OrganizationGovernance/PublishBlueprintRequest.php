<?php

namespace App\Http\Requests\EnterpriseCore\OrganizationGovernance;

use Illuminate\Foundation\Http\FormRequest;

class PublishBlueprintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'clear_existing'           => 'nullable|boolean',
            'create_operating_context' => 'nullable|boolean',
        ];
    }
}
