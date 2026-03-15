<?php

namespace App\Http\Requests\HumanCapital\PayrollBenefits;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCompensationPlanRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'status' => 'in:draft,pending_approval,approved,active,closed',
            'notes'  => 'nullable|string',
        ];
    }
}
