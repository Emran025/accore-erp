<?php

namespace App\Http\Requests\Commercial\MarketingDistribution;

use Illuminate\Foundation\Http\FormRequest;

class DeleteRepresentativeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'required|integer|exists:sales_representatives,id',
        ];
    }
}
