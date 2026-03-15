<?php

namespace App\Http\Requests\Finance\Treasury;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReconciliationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'id' => 'required_without:reconciliation_id|exists:reconciliations,id',
            'reconciliation_id' => 'required_without:id|exists:reconciliations,id',
            'status' => 'nullable|in:draft,reconciled,finalized',
            'notes' => 'nullable|string',
            'amount' => 'required_if:action,adjust|numeric',
            'entry_type' => 'required_if:action,adjust|in:DEBIT,CREDIT',
            'description' => 'required_if:action,adjust|string',
            'action' => 'nullable|string'
        ];
    }
    
    protected function prepareForValidation()
    {
        if ($this->has('reconciliation_id') && !$this->has('id')) {
            $this->merge(['id' => $this->reconciliation_id]);
        }
    }
}
