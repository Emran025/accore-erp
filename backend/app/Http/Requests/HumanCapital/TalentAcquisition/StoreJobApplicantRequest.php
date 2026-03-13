<?php

namespace App\Http\Requests\HumanCapital\TalentAcquisition;

use Illuminate\Foundation\Http\FormRequest;

class StoreJobApplicantRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'requisition_id'    => 'required|exists:recruitment_requisitions,id',
            'first_name'        => 'required|string|max:100',
            'last_name'         => 'required|string|max:100',
            'email'             => 'required|email',
            'phone'             => 'nullable|string|max:20',
            'resume_path'       => 'nullable|string',
            'cover_letter_path' => 'nullable|string',
            'notes'             => 'nullable|string',
        ];
    }
}
