<?php

namespace App\Http\Requests\EnterpriseCore\IdentityAccess;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePermissionTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $id = $this->route('id');
        return [
            'template_name' => 'sometimes|string|max:255',
            'template_key'  => 'sometimes|string|max:100|unique:permission_templates,template_key,' . $id,
            'description'   => 'nullable|string',
            'permissions'   => 'sometimes|array',
            'is_active'     => 'boolean',
        ];
    }
}
