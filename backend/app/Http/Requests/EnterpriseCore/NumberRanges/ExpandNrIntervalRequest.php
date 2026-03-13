<?php

namespace App\Http\Requests\EnterpriseCore\NumberRanges;

use Illuminate\Foundation\Http\FormRequest;

class ExpandNrIntervalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'new_to'  => 'required|integer|min:1',
            'reason'  => 'nullable|string|max:500',
        ];
    }
}
