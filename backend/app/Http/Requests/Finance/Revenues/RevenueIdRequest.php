<?php

namespace App\Http\Requests\Finance\Revenues;

use Illuminate\Foundation\Http\FormRequest;

class RevenueIdRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'required|exists:revenues,id',
        ];
    }
}
