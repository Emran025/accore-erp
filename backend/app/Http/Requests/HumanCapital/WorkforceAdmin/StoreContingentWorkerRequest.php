<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class StoreContingentWorkerRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'full_name'           => 'required|string|max:100',
            'email'               => 'nullable|email',
            'phone'               => 'nullable|string|max:20',
            'worker_type'         => 'required|in:contractor,consultant,freelancer,temp_agency',
            'company_name'        => 'nullable|string|max:255',
            'tax_id'              => 'nullable|string|max:50',
            'start_date'          => 'required|date',
            'end_date'            => 'nullable|date',
            'service_description' => 'nullable|string',
            'sow_number'          => 'nullable|string|max:50',
            'hourly_rate'         => 'nullable|numeric|min:0',
            'monthly_rate'        => 'nullable|numeric|min:0',
            'contract_terms'      => 'nullable|string',
            'badge_expiry'        => 'nullable|date',
            'system_access_expiry'=> 'nullable|date',
            'has_insurance'       => 'boolean',
            'insurance_details'   => 'nullable|string',
            'notes'               => 'nullable|string',
        ];
    }
}
