<?php

namespace App\Http\Requests\HumanCapital\TalentAcquisition;

use Illuminate\Foundation\Http\FormRequest;

class ListRequisitionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => 'nullable|string',
            'department_id' => 'nullable|integer',
        ];
    }
}
