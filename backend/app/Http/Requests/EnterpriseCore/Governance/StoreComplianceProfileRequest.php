<?php

namespace App\Http\Requests\EnterpriseCore\Governance;

use Illuminate\Foundation\Http\FormRequest;

class StoreComplianceProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tax_authority_id'    => 'required|exists:tax_authorities,id',
            'name'                => 'required|string|max:150',
            'code'                => 'required|string|max:40|unique:compliance_profiles,code',
            'policy_type'         => 'required|in:push,pull',
            'transmission_format' => 'required|in:json,xml,yml,excel',
            'key_mapping'         => 'nullable|array',
            'structure_template'  => 'nullable|string',
            // Push fields
            'endpoint_url'        => 'nullable|required_if:policy_type,push|url',
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
