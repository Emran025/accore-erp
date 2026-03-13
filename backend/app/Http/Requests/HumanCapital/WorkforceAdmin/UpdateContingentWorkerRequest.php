<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateContingentWorkerRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'full_name'            => 'string|max:100',
            'email'                => 'nullable|email',
            'phone'                => 'nullable|string|max:20',
            'status'               => 'in:active,inactive,terminated',
            'end_date'             => 'nullable|date',
            'badge_expiry'         => 'nullable|date',
            'system_access_expiry' => 'nullable|date',
            'notes'                => 'nullable|string',
        ];
    }
}
