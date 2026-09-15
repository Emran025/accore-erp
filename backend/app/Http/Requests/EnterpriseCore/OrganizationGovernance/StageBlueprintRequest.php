<?php

namespace App\Http\Requests\EnterpriseCore\OrganizationGovernance;

use Illuminate\Foundation\Http\FormRequest;

class StageBlueprintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'blueprint_uuid' => 'nullable|uuid',
            'name'           => 'required|string|max:255',
            'archetype_id'   => 'required|string|max:50',
            'blueprint_json' => 'required|array',
            'notes'          => 'nullable|string',
        ];
    }
}
