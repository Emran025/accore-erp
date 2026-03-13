<?php

namespace App\Http\Requests\EnterpriseCore\OrgStructure;

use Illuminate\Foundation\Http\FormRequest;

class ListNodesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'node_type_id' => 'nullable|integer',
            'status'       => 'nullable|string',
            'level_domain' => 'nullable|string',
            'search'       => 'nullable|string',
        ];
    }
}
