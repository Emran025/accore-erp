<?php

namespace App\Http\Requests\EnterpriseCore\SystemOverview;

use Illuminate\Foundation\Http\FormRequest;

class UpdateNrObjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'          => 'sometimes|string|max:255',
            'name_en'       => 'nullable|string|max:255',
            'description'   => 'nullable|string|max:500',
            'number_length' => 'sometimes|integer|min:1|max:20',
            'prefix'        => 'nullable|string|max:10',
            'is_active'     => 'sometimes|boolean',
        ];
    }
}
