<?php

namespace App\Http\Requests\Commercial\MarketingDistribution;

use Illuminate\Foundation\Http\FormRequest;

class RepresentativeLedgerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sales_representative_id' => 'required|exists:sales_representatives,id',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'show_deleted' => 'nullable|boolean',
            'search' => 'nullable|string|max:255',
            'type' => 'nullable|string|in:commission,payment,return,adjustment',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ];
    }
}
