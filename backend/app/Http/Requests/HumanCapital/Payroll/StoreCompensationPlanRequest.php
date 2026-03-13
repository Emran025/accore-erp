<?php

namespace App\Http\Requests\HumanCapital\Payroll;

use Illuminate\Foundation\Http\FormRequest;

class StoreCompensationPlanRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'plan_name'      => 'required|string|max:255',
            'plan_type'      => 'required|in:merit,promotion,adjustment,bonus,commission',
            'fiscal_year'    => 'required|string|max:10',
            'effective_date' => 'required|date',
            'budget_pool'    => 'nullable|numeric|min:0',
            'notes'          => 'nullable|string',
        ];
    }
}
