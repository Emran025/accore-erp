<?php

namespace App\Http\Controllers\Api\V2\Finance\TaxCompliance;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Domains\Finance\TaxCompliance\Actions\SubmitZatcaInvoiceAction;
use App\Domains\Finance\TaxCompliance\Actions\GetZatcaStatusAction;
use App\Domains\Finance\TaxCompliance\Models\ZatcaEinvoice;
use App\Http\Resources\Finance\TaxCompliance\ZatcaEinvoiceResource;
use Illuminate\Support\Facades\Log;

class ZATCAInvoiceController extends Controller
{
    use BaseApiController;

    /**
     * Submit an invoice to ZATCA.
     */
    public function submit(Request $request, $invoiceId, SubmitZatcaInvoiceAction $action): JsonResponse
    {
        try {
            $submissionType = $request->input('submission_type', 'reporting');
            $result = $action->execute((int)$invoiceId, $submissionType);

            if (isset($result['status']) && ($result['status'] === 'skipped' || $result['status'] === 'already_submitted')) {
                return $this->successResponse($result, $result['message'] ?? 'ZATCA submission skipped');
            }

            $einvoice = ZatcaEinvoice::where('invoice_id', $invoiceId)->first();
            return $this->successResponse(new ZatcaEinvoiceResource($einvoice), 'ZATCA submission complete');
        } catch (\Exception $e) {
            Log::error("ZATCA Submission Error: " . $e->getMessage(), [
                'invoice_id' => $invoiceId,
                'trace' => $e->getTraceAsString()
            ]);
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Get ZATCA status for an invoice.
     */
    public function getStatus($invoiceId, GetZatcaStatusAction $action): JsonResponse
    {
        $result = $action->execute((int)$invoiceId);
        $einvoice = ZatcaEinvoice::where('invoice_id', $invoiceId)->first();
        return $this->successResponse(new ZatcaEinvoiceResource($einvoice));
    }
}
