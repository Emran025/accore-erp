<?php

namespace App\Http\Requests\EnterpriseCore\SystemOverview;

use Illuminate\Foundation\Http\FormRequest;

class StoreNrObjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'object_type'   => 'required|string|max:50|unique:nr_objects,object_type',
            'name'          => 'required|string|max:255',
            'name_en'       => 'nullable|string|max:255',
            'description'   => 'nullable|string|max:500',
            'number_length' => 'required|integer|min:1|max:20',
            'prefix'        => 'nullable|string|max:10',
        ];
    }
}
