<?php

namespace App\Http\Requests\Platform\Automation;

use Illuminate\Foundation\Http\FormRequest;

class CreateBatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'batch_name' => 'required|string|max:100',
            'batch_type' => 'required|string|max:50',
            'description' => 'nullable|string',
        ];
    }
}
