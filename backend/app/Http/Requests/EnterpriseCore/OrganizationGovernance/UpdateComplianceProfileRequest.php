<?php

namespace App\Http\Requests\EnterpriseCore\OrganizationGovernance;

use Illuminate\Foundation\Http\FormRequest;

class UpdateComplianceProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'                => 'string|max:150',
            'policy_type'         => 'in:push,pull',
            'transmission_format' => 'in:json,xml,yml,excel',
            'key_mapping'         => 'nullable|array',
            'structure_template'  => 'nullable|string',
            // Push fields
            'endpoint_url'        => 'nullable|url',
            'auth_type'           => 'nullable|string|in:none,bearer,basic,oauth2,api_key',
            'auth_credentials'    => 'nullable|string',
            'request_headers'     => 'nullable|array',
            'http_method'         => 'nullable|string|in:POST,PUT,PATCH',
            'openapi_spec'        => 'nullable|array',
            // Pull fields
            'allowed_ips'         => 'nullable|array',
            'pull_endpoint_path'  => 'nullable|string|max:100',
            // Common
            'is_active'           => 'boolean',
            'notes'               => 'nullable|string',
        ];
    }
}
