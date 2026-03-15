<?php

namespace App\Http\Requests\EnterpriseCore\SystemOverview;

use Illuminate\Foundation\Http\FormRequest;

class GetNextNumberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'object_id' => 'required|exists:nr_objects,id',
            'group_id'  => 'required|exists:nr_groups,id',
        ];
    }
}
