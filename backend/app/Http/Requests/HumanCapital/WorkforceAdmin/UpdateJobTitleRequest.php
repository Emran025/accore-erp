<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJobTitleRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title_ar'      => 'sometimes|string|max:255',
            'title_en'      => 'nullable|string|max:255',
            'department_id' => 'nullable|exists:departments,id',
            'description'   => 'nullable|string',
            'is_active'     => 'sometimes|boolean',
        ];
    }
}
