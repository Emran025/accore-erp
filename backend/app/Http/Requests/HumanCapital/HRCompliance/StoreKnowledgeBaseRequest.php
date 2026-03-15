<?php

namespace App\Http\Requests\HumanCapital\HRCompliance;

use Illuminate\Foundation\Http\FormRequest;

class StoreKnowledgeBaseRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title'        => 'required|string|max:255',
            'content'      => 'required|string',
            'category'     => 'required|in:policy,procedure,best_practice,faq,training,other',
            'tags'         => 'nullable|array',
            'file_path'    => 'nullable|string',
            'is_published' => 'boolean',
        ];
    }
}
