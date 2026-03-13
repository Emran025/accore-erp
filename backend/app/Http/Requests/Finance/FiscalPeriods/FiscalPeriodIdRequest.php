<?php

namespace App\Http\Requests\Finance\FiscalPeriods;

use Illuminate\Foundation\Http\FormRequest;

class FiscalPeriodIdRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'required|exists:fiscal_periods,id',
        ];
    }
}
