<?php

namespace App\Http\Requests\HumanCapital\TalentRecruitment;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJobApplicantStatusRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'status'          => 'required|in:applied,screened,assessment,interview,offer,hired,rejected,withdrawn',
            'screening_notes' => 'nullable|string',
            'interview_notes' => 'nullable|string',
        ];
    }
}
