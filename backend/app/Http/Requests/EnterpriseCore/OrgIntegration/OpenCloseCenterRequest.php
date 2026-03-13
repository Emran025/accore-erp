<?php

namespace App\Http\Requests\EnterpriseCore\OrgIntegration;

use Illuminate\Foundation\Http\FormRequest;

class OpenCloseCenterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'required|in:cost,profit',
            'id'   => 'required|integer',
        ];
    }
}
