<?php

namespace App\Http\Requests\HumanCapital\TimeProductivity;

use Illuminate\Foundation\Http\FormRequest;

class StoreWorkforceScheduleRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'schedule_name' => 'required|string|max:255',
            'schedule_date' => 'required|date',
            'department_id' => 'nullable|exists:departments,id',
            'notes'         => 'nullable|string',
        ];
    }
}
