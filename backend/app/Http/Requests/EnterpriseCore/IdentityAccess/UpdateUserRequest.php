<?php

namespace App\Http\Requests\EnterpriseCore\IdentityAccess;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id'         => 'required|exists:users,id',
            'username'   => 'required|string|max:50',
            'password'   => 'nullable|string|min:6',
            'full_name'  => 'nullable|string|max:100',
            'role'       => 'nullable|string|max:20',
            'role_id'    => 'nullable|exists:roles,id',
            'is_active'  => 'nullable|boolean',
            'manager_id' => 'nullable|exists:users,id',
        ];
    }
}
