<?php
namespace App\Domains\Commercial\SalesLifecycle\Actions;
use App\Domains\Shared\Actions\Action;
use App\Domains\Commercial\SalesLifecycle\Models\Invoice;
use App\Domains\Finance\TaxCompliance\Models\ZatcaEinvoice;
use App\Domains\Finance\TaxCompliance\Services\ZATCAService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
class SubmitZatcaInvoiceAction extends Action
{
    public function __construct(private readonly Request $request, private readonly ZATCAService $zatcaService, private readonly int $invoiceId) {}
    public function __invoke(): JsonResponse
    {
        try {
            if (!$this->zatcaService->isEnabled()) {
                return response()->json(['status' => 'skipped', 'message' => 'ZATCA integration is disabled or not applicable for this region.'], 200);
            }
            $invoice = Invoice::findOrFail($this->invoiceId);
            $existing = ZatcaEinvoice::where('invoice_id', $invoice->id)->where('status', 'submitted')->first();
            if ($existing) return response()->json(['status' => 'already_submitted', 'data' => $existing], 200);
            $submissionType = $this->request->input('submission_type', 'reporting');
            return DB::transaction(function () use ($invoice, $submissionType) {
                $result = $this->zatcaService->submitInvoice($invoice, $submissionType);
                $zatcaInvoice = ZatcaEinvoice::updateOrCreate(['invoice_id' => $invoice->id], [
                    'xml_content' => $result['xml_content'], 'hash' => $result['xml_hash'],
                    'signed_xml' => $result['signed_xml'], 'qr_code' => substr($result['qr_code'], 0, 255),
                    'zatca_qr_code' => $result['zatca_qr_code'], 'zatca_uuid' => $result['zatca_uuid'],
                    'status' => $result['status'], 'signed_at' => now(),
                    'submitted_at' => $result['status'] === 'submitted' ? now() : null,
                ]);
                if ($result['status'] === 'rejected') throw new \Exception('ZATCA Rejection: ' . ($result['error_message'] ?? 'Unknown error'));
                return response()->json(['success' => true, 'message' => 'Invoice submitted to ZATCA successfully', 'data' => $zatcaInvoice]);
            });
        } catch (\Exception $e) {
            Log::error("ZATCA Submission Error: " . $e->getMessage(), ['invoice_id' => $this->invoiceId, 'trace' => $e->getTraceAsString()]);
            return response()->json(['success' => false, 'message' => 'Failed to submit invoice to ZATCA', 'error' => $e->getMessage()], 500);
        }
    }
}
