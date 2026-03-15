<?php

namespace App\Http\Requests\HumanCapital\TalentRecruitment;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRequisitionRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'job_title'       => 'string|max:255',
            'job_description' => 'nullable|string',
            'status'          => 'in:draft,pending_approval,approved,rejected,closed,filled',
            'is_published'    => 'boolean',
            'notes'           => 'nullable|string',
            'approved_by'     => 'nullable|integer', // Optional parameter used in auth checking
        ];
    }
}
