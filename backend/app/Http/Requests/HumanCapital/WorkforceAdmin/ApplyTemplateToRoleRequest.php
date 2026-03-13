<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class ApplyTemplateToRoleRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'template_id' => 'required|exists:permission_templates,id',
            'role_id'     => 'required|exists:roles,id',
        ];
    }
}
