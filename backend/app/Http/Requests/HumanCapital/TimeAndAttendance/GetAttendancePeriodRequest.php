<?php

namespace App\Http\Requests\HumanCapital\TimeAndAttendance;

use Illuminate\Foundation\Http\FormRequest;

class GetAttendancePeriodRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after_or_equal:start_date'
        ];
    }
}
