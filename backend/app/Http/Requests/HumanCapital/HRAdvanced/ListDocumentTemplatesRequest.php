<?php

namespace App\Http\Requests\HumanCapital\HRAdvanced;

use Illuminate\Foundation\Http\FormRequest;

class ListDocumentTemplatesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'nullable|string',
            'search' => 'nullable|string',
        ];
    }
}
