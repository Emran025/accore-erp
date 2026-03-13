<?php

namespace App\Http\Requests\HumanCapital\WorkforceAdmin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRelationsCaseRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'status'        => 'sometimes|in:open,under_investigation,hearing,resolved,closed,escalated',
            'resolution'    => 'nullable|string',
            'resolved_date' => 'nullable|date',
            'notes'         => 'nullable|string',
        ];
    }
}
