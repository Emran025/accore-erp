<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBenefitsPlanRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'plan_name'   => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'sometimes|boolean',
            'expiry_date' => 'nullable|date',
        ];
    }
}
