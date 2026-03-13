<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePermissionTemplateRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'template_name' => 'sometimes|string|max:255',
            'description'   => 'nullable|string',
            'permissions'   => 'sometimes|array',
            'is_active'     => 'sometimes|boolean',
        ];
    }
}
