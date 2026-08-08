<?php

namespace App\Http\Requests\Commercial\MarketingDistribution;

use Illuminate\Foundation\Http\FormRequest;

class ListRepresentativesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'page'     => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:2000',
            'limit'    => 'nullable|integer|min:1|max:2000',
            'search'   => 'nullable|string|max:255',
        ];
    }
}
