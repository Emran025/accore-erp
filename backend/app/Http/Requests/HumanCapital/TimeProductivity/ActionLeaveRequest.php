<?php

namespace App\Http\Requests\HumanCapital\TimeProductivity;

use Illuminate\Foundation\Http\FormRequest;

class ActionLeaveRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'action' => 'required|in:approved,rejected',
            'reason' => 'nullable|string|required_if:action,rejected'
        ];
    }
}
