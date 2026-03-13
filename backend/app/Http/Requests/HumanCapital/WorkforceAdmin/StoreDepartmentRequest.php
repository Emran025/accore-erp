<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class StoreDepartmentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name_ar'    => 'required|string|max:100',
            'name_en'    => 'nullable|string|max:100',
            'manager_id' => 'nullable|exists:employees,id',
        ];
    }
}
