<?php

namespace App\Http\Requests\EnterpriseCore\SystemOverview;

use Illuminate\Foundation\Http\FormRequest;

class StoreNrIntervalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code'        => 'required|string|max:20',
            'description' => 'nullable|string|max:500',
            'from_number' => 'required|integer|min:1',
            'to_number'   => 'required|integer|min:1',
            'is_external' => 'sometimes|boolean',
        ];
    }
}
