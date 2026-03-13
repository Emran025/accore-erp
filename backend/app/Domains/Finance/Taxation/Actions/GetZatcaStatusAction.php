<?php

namespace App\Domains\Finance\Taxation\Actions;

use App\Domains\Finance\Taxation\Models\ZatcaEinvoice;

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
