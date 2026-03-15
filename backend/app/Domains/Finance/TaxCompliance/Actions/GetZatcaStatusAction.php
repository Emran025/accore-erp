<?php

namespace App\Domains\Finance\TaxCompliance\Actions;

use App\Domains\Finance\TaxCompliance\Models\ZatcaEinvoice;

class GetZatcaStatusAction
{
    public function execute(int $invoiceId): array
    {
        $zatca = ZatcaEinvoice::where('invoice_id', $invoiceId)->first();
        
        if (!$zatca) {
            return ['status' => 'not_generated'];
        }
        
        return [
            'status' => $zatca->status,
            'data' => $zatca->toArray()
        ];
    }
}
