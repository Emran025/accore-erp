<?php

namespace App\Http\Requests\HumanCapital\TimeProductivity;

use Illuminate\Foundation\Http\FormRequest;

class MyAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_date' => 'nullable|date',
            'end_date'   => 'nullable|date|after_or_equal:start_date'
        ];
    }
    
    protected function prepareForValidation()
    {
        $this->merge([
            'start_date' => $this->input('start_date', now()->startOfMonth()->toDateString()),
            'end_date'   => $this->input('end_date', now()->endOfMonth()->toDateString())
        ]);
    }
}
