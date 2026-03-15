<?php

namespace App\Http\Requests\HumanCapital\TalentRecruitment;

use Illuminate\Foundation\Http\FormRequest;

class StoreOnboardingDocumentRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'document_name' => 'required|string|max:255',
            'document_type' => 'required|in:i9,w4,direct_deposit,nda,contract,policy,other',
            'file_path'     => 'nullable|string',
            'notes'         => 'nullable|string',
        ];
    }
}
