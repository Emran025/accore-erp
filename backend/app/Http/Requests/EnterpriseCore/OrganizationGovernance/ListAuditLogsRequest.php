<?php

namespace App\Http\Requests\EnterpriseCore\OrganizationGovernance;

use Illuminate\Foundation\Http\FormRequest;

class ListAuditLogsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date_from' => 'nullable|date',
            'date_to'   => 'nullable|date|after_or_equal:date_from',
            'action'    => 'nullable|string',
            'module'    => 'nullable|string',
            'search'    => 'nullable|string',
            'limit'     => 'nullable|integer|min:1|max:100',
        ];
    }
}
