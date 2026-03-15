<?php

namespace App\Domains\EnterpriseCore\Automation\Actions;

use App\Domains\Finance\Treasury\Models\RecurringTransaction;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;

class ProcessRecurringTransactionAction
{
    public function __construct(
        private readonly LedgerService $ledgerService
    ) {}

    public function execute(array $data): array
    {
        $templateId = $data['template_id'];
        $generationDate = $data['generation_date'] ?? now()->format('Y-m-d');

        $template = RecurringTransaction::findOrFail($templateId);
        $templateData = $template->template_data;

        $voucherNumber = null;

        if ($template->type === 'expense') {
            $voucherNumber = $this->ledgerService->postTransaction([
                [
                    'account_code' => $templateData['account_code'],
                    'entry_type' => 'DEBIT',
                    'amount' => $templateData['amount'],
                    'description' => $templateData['description'],
                ],
                [
                    'account_code' => '1110',
                    'entry_type' => 'CREDIT',
                    'amount' => $templateData['amount'],
                    'description' => $templateData['description'],
                ],
            ], 'recurring_transactions', $template->id, null, $generationDate);
        } elseif ($template->type === 'revenue') {
            $voucherNumber = $this->ledgerService->postTransaction([
                [
                    'account_code' => '1110',
                    'entry_type' => 'DEBIT',
                    'amount' => $templateData['amount'],
                    'description' => $templateData['description'],
                ],
                [
                    'account_code' => $templateData['account_code'],
                    'entry_type' => 'CREDIT',
                    'amount' => $templateData['amount'],
                    'description' => $templateData['description'],
                ],
            ], 'recurring_transactions', $template->id, null, $generationDate);
        } elseif ($template->type === 'journal_voucher') {
            $voucherNumber = $this->ledgerService->postTransaction(
                $templateData['entries'],
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

        return ['voucher_number' => $voucherNumber];
    }
}

