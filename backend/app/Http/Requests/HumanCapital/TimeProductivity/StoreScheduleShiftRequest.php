<?php

namespace App\Http\Requests\HumanCapital\TimeProductivity;

use Illuminate\Foundation\Http\FormRequest;

class StoreScheduleShiftRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_id' => 'required|exists:employees,id',
            'shift_date'  => 'required|date',
            'start_time'  => 'required',
            'end_time'    => 'required',
            'shift_type'  => 'required|in:regular,overtime,on_call,standby',
            'notes'       => 'nullable|string',
        ];
    }
}
