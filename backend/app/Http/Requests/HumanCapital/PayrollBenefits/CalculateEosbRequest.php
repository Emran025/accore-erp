<?php

namespace App\Http\Requests\HumanCapital\PayrollBenefits;

use Illuminate\Foundation\Http\FormRequest;

class CalculateEosbRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        // For preview endpoint, employee_id is required. For calculate, it's a URL parameter.
        // So we make it conditionally required or handle it per case.
        // Actually, employee_id is only inside the preview request validate.
        $isPreview = $this->route()->getName() === 'payroll.eosb.preview' || $this->has('employee_id');

        return [
            'employee_id'        => $isPreview ? 'required|exists:employees,id' : 'nullable',
            'termination_date'   => 'required|date',
            'termination_reason' => 'required|in:resignation,termination,end_of_contract',
        ];
    }
}
