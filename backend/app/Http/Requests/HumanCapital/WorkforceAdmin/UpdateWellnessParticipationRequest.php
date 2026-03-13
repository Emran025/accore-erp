<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWellnessParticipationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'metrics_data' => 'nullable|array',
            'points'       => 'nullable|integer|min:0',
            'status'       => 'sometimes|in:enrolled,active,completed,dropped',
            'notes'        => 'nullable|string',
        ];
    }
}
