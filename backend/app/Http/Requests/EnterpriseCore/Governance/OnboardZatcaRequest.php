<?php

namespace App\Http\Requests\EnterpriseCore\Governance;

use Illuminate\Foundation\Http\FormRequest;

class OnboardZatcaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'otp'      => 'required|string',
            'csr_data' => 'nullable|array',
        ];
    }
}
