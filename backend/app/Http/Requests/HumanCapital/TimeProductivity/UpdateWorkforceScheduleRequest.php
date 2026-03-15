<?php

namespace App\Http\Requests\HumanCapital\TimeProductivity;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWorkforceScheduleRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'schedule_name' => 'sometimes|string|max:255',
            'status'        => 'sometimes|in:draft,published,archived',
            'notes'         => 'nullable|string',
        ];
    }
}
