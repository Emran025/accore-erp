<?php

namespace App\Http\Requests\EnterpriseCore\NumberRanges;

use App\Domains\EnterpriseCore\NumberRanges\Models\NrInterval;
use Illuminate\Foundation\Http\FormRequest;

class UpdateNrIntervalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $intervalId = $this->route('intervalId');
        $interval = NrInterval::findOrFail($intervalId);
        
        return [
            'code'        => "sometimes|string|max:20|unique:nr_intervals,code,{$intervalId},id,nr_object_id,{$interval->nr_object_id}",
            'description' => 'nullable|string|max:500',
            'is_external' => 'sometimes|boolean',
            'is_active'   => 'sometimes|boolean',
        ];
    }
}
