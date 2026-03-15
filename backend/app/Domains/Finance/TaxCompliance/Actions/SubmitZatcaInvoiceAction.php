<?php

namespace App\Domains\Finance\TaxCompliance\Actions;

use App\Domains\Commercial\SalesLifecycle\Models\Invoice;
use App\Domains\Finance\TaxCompliance\Models\ZatcaEinvoice;
use App\Domains\Finance\TaxCompliance\Services\ZATCAService;
use Illuminate\Support\Facades\DB;
use Exception;

class SubmitZatcaInvoiceAction
{
    public function __construct(
        private readonly ZATCAService $zatcaService
    ) {}

    public function execute(int $invoiceId, string $submissionType = 'reporting'): array
    {
        // Check if ZATCA is enabled
        if (!$this->zatcaService->isEnabled()) {
            return [
                'status' => 'skipped',
                'message' => 'ZATCA integration is disabled or not applicable for this region.'
            ];
        }

        $invoice = Invoice::findOrFail($invoiceId);

        // Check if already submitted
        $existing = ZatcaEinvoice::where('invoice_id', $invoice->id)
            ->where('status', 'submitted')
            ->first();

        if ($existing) {
            return [
                'status' => 'already_submitted',
                'data' => $existing->toArray()
            ];
        }

        return DB::transaction(function () use ($invoice, $submissionType) {
            // Use ZATCA Service to handle submission
            $result = $this->zatcaService->submitInvoice($invoice, $submissionType);

            $zatcaInvoice = ZatcaEinvoice::updateOrCreate(
                ['invoice_id' => $invoice->id],
                [
                    'xml_content' => $result['xml_content'],
                    'hash' => $result['xml_hash'],
                    'signed_xml' => $result['signed_xml'],
                    'qr_code' => substr($result['qr_code'], 0, 255),
                    'zatca_qr_code' => $result['zatca_qr_code'],
                    'zatca_uuid' => $result['zatca_uuid'],
                    'status' => $result['status'],
                    'signed_at' => now(),
                    'submitted_at' => $result['status'] === 'submitted' ? now() : null,
                ]
            );

            if ($result['status'] === 'rejected') {
                throw new Exception('ZATCA Rejection: ' . ($result['error_message'] ?? 'Unknown error'));
            }

            return [
                'success' => true,
                'message' => 'Invoice submitted to ZATCA successfully',
                'data' => $zatcaInvoice->toArray()
            ];
        });
    }
}
