<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class StoreWellnessProgramRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'program_name'   => 'required|string|max:255',
            'description'    => 'nullable|string',
            'program_type'   => 'required|in:steps_challenge,health_challenge,fitness,nutrition,mental_health,other',
            'start_date'     => 'required|date',
            'end_date'       => 'required|date|after:start_date',
            'target_metrics' => 'nullable|array',
            'notes'          => 'nullable|string',
        ];
    }
}
