<?php

namespace App\Http\Requests\HumanCapital\PayrollBenefits;

use Illuminate\Foundation\Http\FormRequest;

class ReconcilePostPayrollIntegrationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'reconciled_amount' => 'required|numeric|min:0',
        ];
    }
}
