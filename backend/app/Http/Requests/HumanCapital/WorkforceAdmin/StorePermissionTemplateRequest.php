<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class StorePermissionTemplateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'template_name'               => 'required|string|max:255',
            'template_key'                => 'required|string|max:100|unique:permission_templates,template_key',
            'description'                 => 'nullable|string',
            'permissions'                 => 'required|array',
            'permissions.*.module_key'    => 'required|string',
            'permissions.*.can_view'      => 'required|boolean',
            'permissions.*.can_create'    => 'required|boolean',
            'permissions.*.can_edit'      => 'required|boolean',
            'permissions.*.can_delete'    => 'required|boolean',
        ];
    }
}
