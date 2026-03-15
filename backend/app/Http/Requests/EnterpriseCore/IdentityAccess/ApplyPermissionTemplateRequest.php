<?php

namespace App\Http\Requests\EnterpriseCore\IdentityAccess;

use Illuminate\Foundation\Http\FormRequest;

class ApplyPermissionTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'template_id' => 'required|exists:permission_templates,id',
            'user_ids'    => 'required|array',
            'user_ids.*'  => 'exists:users,id',
        ];
    }
}
