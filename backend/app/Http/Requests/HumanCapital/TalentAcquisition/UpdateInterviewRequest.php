<?php

namespace App\Http\Requests\HumanCapital\TalentAcquisition;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInterviewRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'status'       => 'in:scheduled,completed,cancelled,no_show',
            'rating'       => 'nullable|integer|min:1|max:5',
            'feedback'     => 'nullable|string',
            'completed_at' => 'nullable|date',
        ];
    }
}
