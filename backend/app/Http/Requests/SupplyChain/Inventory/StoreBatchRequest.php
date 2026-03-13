<?php

namespace App\Http\Requests\SupplyChain\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class StoreBatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'batch_name' => 'required_without:action|string|max:100',
            'batch_type' => 'required_without:action|string|max:50',
            'description' => 'nullable|string',
            'action' => 'nullable|string',
            'batch_id' => 'required_with:action|exists:batches,id',
        ];
    }
}
