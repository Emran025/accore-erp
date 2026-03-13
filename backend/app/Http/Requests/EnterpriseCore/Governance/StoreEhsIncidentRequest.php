<?php

namespace App\Http\Requests\EnterpriseCore\Governance;

use Illuminate\Foundation\Http\FormRequest;

class StoreEhsIncidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => 'nullable|exists:employees,id',
            'incident_type' => 'required|in:accident,near_miss,injury,illness,property_damage,environmental,other',
            'incident_date' => 'required|date',
            'incident_time' => 'nullable',
            'location' => 'nullable|string|max:255',
            'description' => 'required|string',
            'severity' => 'required|in:minor,moderate,serious,critical,fatal',
            'immediate_action_taken' => 'nullable|string',
            'osha_reportable' => 'boolean',
            'notes' => 'nullable|string',
        ];
    }
}
