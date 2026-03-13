<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePositionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'position_name_ar' => 'sometimes|string|max:255',
            'position_name_en' => 'nullable|string|max:255',
            'job_title_id'     => 'sometimes|exists:job_titles,id',
            'role_id'          => 'nullable|exists:roles,id',
            'department_id'    => 'nullable|exists:departments,id',
            'grade_level'      => 'nullable|string|max:50',
            'min_salary'       => 'nullable|numeric|min:0',
            'max_salary'       => 'nullable|numeric|min:0',
            'description'      => 'nullable|string',
            'is_active'        => 'sometimes|boolean',
        ];
    }
}
