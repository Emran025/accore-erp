<?php

namespace App\Http\Requests\Commercial\SalesLifecycle;

use Illuminate\Foundation\Http\FormRequest;

class ListServiceInvoicesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'per_page'     => 'nullable|integer|min:1|max:100',
            'payment_type' => 'nullable|string|in:cash,credit',
            'customer_id'  => 'nullable|integer|exists:ar_customers,id',
        ];
    }
}
