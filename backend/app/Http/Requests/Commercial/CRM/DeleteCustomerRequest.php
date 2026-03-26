<?php

namespace App\Http\Requests\Commercial\CRM;

use Illuminate\Foundation\Http\FormRequest;

class DeleteCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'required|integer|exists:ar_customers,id',
        ];
    }
}
