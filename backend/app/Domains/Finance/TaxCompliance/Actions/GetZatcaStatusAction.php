<?php

namespace App\Domains\Finance\TaxCompliance\Actions;

use App\Domains\Finance\TaxCompliance\Models\ZatcaEinvoice;
use Illuminate\Support\Collection;

class GetZatcaStatusAction
{
    public function execute(int $invoiceId): Collection
    {
        $zatca = ZatcaEinvoice::where('invoice_id', $invoiceId)->first();
        
        if (!$zatca) {
            return collect(['status' => 'not_generated']);
        }
        
        return collect([
            'status' => $zatca->status,
            'data' => $zatca->toArray()
        ]);
    }
}
