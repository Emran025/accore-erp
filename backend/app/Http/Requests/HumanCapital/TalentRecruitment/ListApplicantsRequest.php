<?php

namespace App\Http\Requests\HumanCapital\TalentRecruitment;

use Illuminate\Foundation\Http\FormRequest;

class ListApplicantsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'requisition_id' => 'nullable|integer',
            'status' => 'nullable|string',
        ];
    }
}
