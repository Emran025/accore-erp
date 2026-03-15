<?php

namespace App\Http\Requests\EnterpriseCore\SystemOverview;

use App\Domains\EnterpriseCore\SystemOverview\Models\NrGroup;
use Illuminate\Foundation\Http\FormRequest;

class UpdateNrGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $groupId = $this->route('groupId');
        $group = NrGroup::findOrFail($groupId);
        
        return [
            'code'        => "sometimes|string|max:20|unique:nr_groups,code,{$groupId},id,nr_object_id,{$group->nr_object_id}",
            'name'        => 'sometimes|string|max:255',
            'name_en'     => 'nullable|string|max:255',
            'description' => 'nullable|string|max:500',
            'is_active'   => 'sometimes|boolean',
        ];
    }
}
