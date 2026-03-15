<?php

namespace App\Http\Requests\EnterpriseCore\IdentityAccess;

use Illuminate\Foundation\Http\FormRequest;

class StorePermissionTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'template_name' => 'required|string|max:255',
            'template_key'  => 'required|string|max:100|unique:permission_templates,template_key',
            'description'   => 'nullable|string',
            'permissions'   => 'required|array',
            'is_active'     => 'boolean',
        ];
    }
}
