<?php

namespace App\Http\Requests\EnterpriseCore\SystemOverview;

use Illuminate\Foundation\Http\FormRequest;

class StoreNrGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $objectId = $this->route('objectId');
        return [
            'code'        => "required|string|max:20|unique:nr_groups,code,NULL,id,nr_object_id,{$objectId}",
            'name'        => 'required|string|max:255',
            'name_en'     => 'nullable|string|max:255',
            'description' => 'nullable|string|max:500',
        ];
    }
}
