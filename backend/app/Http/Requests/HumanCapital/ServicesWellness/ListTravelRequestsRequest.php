<?php

namespace App\Http\Requests\HumanCapital\ServicesWellness;

use Illuminate\Foundation\Http\FormRequest;

class ListTravelRequestsRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'employee_id' => 'nullable|exists:employees,id',
            'status'      => 'nullable|string|max:50',
        ];
    }
}
