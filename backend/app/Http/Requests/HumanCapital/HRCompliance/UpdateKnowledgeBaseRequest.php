<?php

namespace App\Http\Requests\HumanCapital\HRCompliance;

use Illuminate\Foundation\Http\FormRequest;

class UpdateKnowledgeBaseRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'        => 'sometimes|string|max:255',
            'content'      => 'sometimes|string',
            'is_published' => 'sometimes|boolean',
            'tags'         => 'nullable|array',
        ];
    }
}
