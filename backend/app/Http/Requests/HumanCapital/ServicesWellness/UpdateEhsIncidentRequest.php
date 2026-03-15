<?php

namespace App\Http\Requests\HumanCapital\ServicesWellness;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEhsIncidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => 'in:reported,under_investigation,resolved,closed',
            'root_cause' => 'nullable|string',
            'preventive_measures' => 'nullable|string',
            'investigated_by' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ];
    }
}
