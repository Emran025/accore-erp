<?php

namespace App\Http\Requests\EnterpriseCore\IdentityAccess;

use Illuminate\Foundation\Http\FormRequest;

class ListRolesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'action'  => 'nullable|string|in:roles,modules,role_permissions',
            'role_id' => 'nullable|integer|exists:roles,id',
        ];
    }
}
