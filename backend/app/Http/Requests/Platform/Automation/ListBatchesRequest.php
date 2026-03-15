<?php

namespace App\Http\Requests\Platform\Automation;

use Illuminate\Foundation\Http\FormRequest;

class ListBatchesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'page' => 'nullable|integer|min:1',
            'limit' => 'nullable|integer|min:1|max:100',
        ];
    }
}
