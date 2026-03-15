<?php

namespace App\Http\Requests\HumanCapital\TimeProductivity;

use Illuminate\Foundation\Http\FormRequest;

class BulkImportAttendanceRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'records'               => 'required|array',
            'records.*.employee_id' => 'required|exists:employees,id',
            'records.*.date'        => 'required|date',
            'records.*.check_in'    => 'nullable|date_format:H:i',
            'records.*.check_out'   => 'nullable|date_format:H:i',
            'records.*.status'      => 'nullable|in:present,absent,leave,holiday,weekend'
        ];
    }
}
