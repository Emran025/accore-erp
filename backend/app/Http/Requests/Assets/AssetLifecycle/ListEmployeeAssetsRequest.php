<?php

namespace App\Http\Requests\Assets\AssetLifecycle;

use Illuminate\Foundation\Http\FormRequest;

class ListEmployeeAssetsRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_id' => 'nullable|exists:employees,id',
            'status'      => 'nullable|string|max:50',
            'per_page'    => 'nullable|integer|min:1|max:100',
        ];
    }
}
