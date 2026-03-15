<?php
namespace App\Domains\Commercial\SalesLifecycle\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\TaxCompliance\Models\ZatcaEinvoice;
use Illuminate\Http\JsonResponse;
class GetZatcaStatusAction extends Action
{
    public function __construct(private readonly int $invoiceId) {}
    public function __invoke(): JsonResponse
    {
        $zatca = ZatcaEinvoice::where('invoice_id', $this->invoiceId)->first();
        if (!$zatca) return response()->json(['status' => 'not_generated']);
        return response()->json(['status' => $zatca->status, 'data' => $zatca]);
    }
}
