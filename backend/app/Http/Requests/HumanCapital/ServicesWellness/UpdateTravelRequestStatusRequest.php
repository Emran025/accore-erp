<?php

namespace App\Http\Requests\HumanCapital\ServicesWellness;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTravelRequestStatusRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'status'           => 'required|in:draft,pending_approval,approved,rejected,cancelled,completed',
            'rejection_reason' => 'nullable|string|required_if:status,rejected',
        ];
    }
}
