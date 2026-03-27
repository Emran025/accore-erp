<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Finance\Treasury\Models\Reconciliation;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;

class UpdateReconciliationAction
{
    public function __construct(
        protected LedgerService $ledgerService
    ) {}

    public function execute(array $data, int $id): Reconciliation
    {
        $reconciliation = Reconciliation::findOrFail($id);

        if (($data['action'] ?? null) === 'adjust') {
            // Post adjustment to GL
            // The provided entry_type applies to the cash/bank account (1110)
            $offsetAccount = $data['entry_type'] === 'DEBIT' ? '5290' : '5101';
            
            $this->ledgerService->postTransaction([
                [
                    'account_code' => '1110', 
                    'entry_type' => $data['entry_type'], 
                    'amount' => $data['amount'], 
                    'description' => $data['description']
                ],
                [
                    'account_code' => $offsetAccount, 
                    'entry_type' => $data['entry_type'] === 'DEBIT' ? 'CREDIT' : 'DEBIT', 
                    'amount' => $data['amount'], 
                    'description' => $data['description']
                ],
            ], 'reconciliations', $reconciliation->id, null, $reconciliation->reconciliation_date);

            // Recalculate difference
            $newLedgerBalance = $this->ledgerService->getAccountBalance('1110', $reconciliation->reconciliation_date);
            $reconciliation->update([
                'ledger_balance' => $newLedgerBalance,
                'difference' => $reconciliation->physical_balance - $newLedgerBalance,
                'status' => 'reconciled'
            ]);
        } else {
            $reconciliation->update($data);
        }

        return $reconciliation;
    }
}

