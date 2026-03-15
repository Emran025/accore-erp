<?php

namespace App\Http\Requests\HumanCapital\ServicesWellness;

use Illuminate\Foundation\Http\FormRequest;

class StoreTravelRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_id'    => 'required|exists:employees,id',
            'destination'    => 'required|string|max:255',
            'purpose'        => 'required|string',
            'departure_date' => 'required|date',
            'return_date'    => 'required|date|after:departure_date',
            'estimated_cost' => 'nullable|numeric|min:0',
            'notes'          => 'nullable|string',
        ];
    }
}
