<?php

namespace App\Http\Requests\Commercial\SalesLifecycle;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceSaleRequest extends FormRequest
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
            'payment_type'      => 'required|in:cash,credit',
            'customer_id'       => 'nullable|integer|exists:ar_customers,id',
            'amount_paid'       => 'nullable|numeric|min:0',
            'discount_amount'   => 'nullable|numeric|min:0',
            'invoice_number'    => 'nullable|string|max:50',
            'items'             => 'required|array|min:1',
            'items.*.service_id'=> 'required|integer|exists:products,id',
            'items.*.quantity'  => 'required|numeric|min:0.01',
            'items.*.unit_price'=> 'required|numeric|min:0',
            'items.*.description' => 'nullable|string',
        ];
    }
}
