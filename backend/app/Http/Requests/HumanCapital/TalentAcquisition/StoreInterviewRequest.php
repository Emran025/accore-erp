<?php

namespace App\Http\Requests\HumanCapital\TalentAcquisition;

use Illuminate\Foundation\Http\FormRequest;

class StoreInterviewRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'applicant_id'   => 'required|exists:job_applicants,id',
            'interviewer_id' => 'required|exists:users,id',
            'interview_type' => 'required|in:phone,video,in_person,panel',
            'scheduled_at'   => 'required|date',
            'location'       => 'nullable|string|max:255',
            'meeting_link'   => 'nullable|string',
            'notes'          => 'nullable|string',
        ];
    }
}
