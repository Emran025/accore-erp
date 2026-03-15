<?php

namespace App\Http\Requests\HumanCapital\HRCompliance;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQaComplianceRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'status' => 'in:pending,in_progress,completed,non_compliant,cancelled',
            'findings' => 'nullable|string',
            'corrective_action' => 'nullable|string',
            'completed_date' => 'nullable|date',
        ];
    }
}
