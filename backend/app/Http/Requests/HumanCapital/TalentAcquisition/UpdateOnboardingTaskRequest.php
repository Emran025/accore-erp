<?php

namespace App\Http\Requests\HumanCapital\TalentAcquisition;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOnboardingTaskRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'status' => 'in:pending,in_progress,completed,blocked',
            'notes'  => 'nullable|string',
        ];
    }
}
