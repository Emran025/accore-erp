<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class ListPositionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'department_id' => 'nullable|integer|exists:departments,id',
            'job_title_id'  => 'nullable|integer|exists:job_titles,id',
            'role_id'       => 'nullable|integer|exists:iam_roles,id',
            'search'        => 'nullable|string',
            'is_active'     => 'nullable|boolean',
        ];
    }
}
