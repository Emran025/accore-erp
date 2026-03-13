<?php

namespace App\Domains\DigitalPlatform\Automation\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\JournalVouchers\Models\RecurringTransaction;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProcessRecurringTransactionAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly LedgerService $ledgerService
    ) {}

    public function __invoke(): JsonResponse
    {
        $templateId = $this->request->input('template_id');
        $generationDate = $this->request->input('generation_date', now()->format('Y-m-d'));

        $template = RecurringTransaction::findOrFail($templateId);
        $data = $template->template_data;

        $voucherNumber = null;

        if ($template->type === 'expense') {
            $voucherNumber = $this->ledgerService->postTransaction([
                [
                    'account_code' => $data['account_code'],
                    'entry_type' => 'DEBIT',
                    'amount' => $data['amount'],
                    'description' => $data['description'],
                ],
                [
                    'account_code' => '1110',
                    'entry_type' => 'CREDIT',
                    'amount' => $data['amount'],
                    'description' => $data['description'],
                ],
            ], 'recurring_transactions', $template->id, null, $generationDate);
        } elseif ($template->type === 'revenue') {
            $voucherNumber = $this->ledgerService->postTransaction([
                [
                    'account_code' => '1110',
                    'entry_type' => 'DEBIT',
                    'amount' => $data['amount'],
                    'description' => $data['description'],
                ],
                [
                    'account_code' => $data['account_code'],
                    'entry_type' => 'CREDIT',
                    'amount' => $data['amount'],
                    'description' => $data['description'],
                ],
            ], 'recurring_transactions', $template->id, null, $generationDate);
        } elseif ($template->type === 'journal_voucher') {
            $voucherNumber = $this->ledgerService->postTransaction(
                $data['entries'],
                'recurring_transactions',
                $template->id,
                null,
                $generationDate
            );
        }

        $nextDate = new \DateTime($template->next_due_date);
        switch ($template->frequency) {
            case 'daily':
                $nextDate->modify('+1 day');
                break;
            case 'weekly':
                $nextDate->modify('+1 week');
                break;
            case 'monthly':
                $nextDate->modify('+1 month');
                break;
            case 'quarterly':
                $nextDate->modify('+3 months');
                break;
            case 'annually':
                $nextDate->modify('+1 year');
                break;
        }

        $template->update([
            'last_generated_date' => $generationDate,
            'next_due_date' => $nextDate->format('Y-m-d'),
        ]);

        return $this->successResponse(['voucher_number' => $voucherNumber]);
    }
}

