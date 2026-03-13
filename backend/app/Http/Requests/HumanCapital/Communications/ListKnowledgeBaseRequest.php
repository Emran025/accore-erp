<?php

namespace App\Http\Requests\HumanCapital\Communications;

use Illuminate\Foundation\Http\FormRequest;

class ListKnowledgeBaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category' => 'nullable|string',
            'is_published' => 'nullable|string|in:true,false,1,0',
            'search' => 'nullable|string',
        ];
    }
}
