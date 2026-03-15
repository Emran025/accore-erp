<?php

namespace App\Http\Requests\EnterpriseCore\SystemOverview;

use Illuminate\Foundation\Http\FormRequest;

class StoreNrAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nr_group_id'    => 'required|exists:nr_groups,id',
            'nr_interval_id' => 'required|exists:nr_intervals,id',
        ];
    }
}
