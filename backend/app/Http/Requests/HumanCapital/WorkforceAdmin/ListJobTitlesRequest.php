<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class ListJobTitlesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'department_id' => 'nullable|integer|exists:departments,id',
            'search'        => 'nullable|string',
            'is_active'     => 'nullable|boolean',
        ];
    }
}
