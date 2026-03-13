<?php

namespace App\Http\Requests\EnterpriseCore\IAM;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePermissionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role_id'                    => 'required|exists:roles,id',
            'permissions'                => 'required|array',
            'permissions.*.module_id'    => 'required|exists:modules,id',
            'permissions.*.can_view'     => 'required|integer|in:0,1',
            'permissions.*.can_create'   => 'required|integer|in:0,1',
            'permissions.*.can_edit'     => 'required|integer|in:0,1',
            'permissions.*.can_delete'   => 'required|integer|in:0,1',
        ];
    }
}
