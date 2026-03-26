<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class ListBenefitsPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plan_type' => 'nullable|string',
            'is_active' => 'nullable|string|in:true,false',
            'per_page' => 'nullable|integer|min:1|max:100',
        ];
    }
}
