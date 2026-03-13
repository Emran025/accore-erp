<?php

namespace App\Http\Requests\HumanCapital\TalentDevelopment;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePerformanceAppraisalRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'status'           => 'sometimes|in:draft,self_review,manager_review,calibration,completed,cancelled',
            'ratings'          => 'nullable|array',
            'self_assessment'  => 'nullable|string',
            'manager_feedback' => 'nullable|string',
            'peer_feedback'    => 'nullable|string',
            'overall_rating'   => 'nullable|numeric|min:1|max:5',
            'notes'            => 'nullable|string',
        ];
    }
}
