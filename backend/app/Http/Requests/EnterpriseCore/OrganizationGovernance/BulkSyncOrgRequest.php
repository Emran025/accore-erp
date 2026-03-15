<?php

namespace App\Http\Requests\EnterpriseCore\OrganizationGovernance;

use Illuminate\Foundation\Http\FormRequest;

class BulkSyncOrgRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'targets'   => 'required|array',
            'targets.*' => 'in:cost_centers,profit_centers,job_titles,nodes_to_tables',
        ];
    }
}
