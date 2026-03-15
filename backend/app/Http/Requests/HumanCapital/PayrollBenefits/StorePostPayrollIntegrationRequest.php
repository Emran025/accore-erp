<?php

namespace App\Http\Requests\HumanCapital\PayrollBenefits;

use Illuminate\Foundation\Http\FormRequest;

class StorePostPayrollIntegrationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'payroll_cycle_id' => 'required|exists:payroll_cycles,id',
            'integration_type' => 'required|in:bank_file,gl_entry,third_party_pay,garnishment',
            'file_format'      => 'nullable|string|max:50',
            'notes'            => 'nullable|string',
        ];
    }
}
