<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Finance\Treasury\Models\Reconciliation;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;

class CreateReconciliationAction
{
    public function __construct(
        protected LedgerService $ledgerService
    ) {}

    public function execute(array $data): array
    {
        $accountCode = $data['account_code'] ?? '1110';
        
        $ledgerBalance = $this->ledgerService->getAccountBalance($accountCode, $data['reconciliation_date']);
        
        $reconciliation = Reconciliation::create([
            'account_code' => $accountCode,
            'reconciliation_date' => $data['reconciliation_date'],
            'physical_balance' => $data['physical_balance'],
            'ledger_balance' => $ledgerBalance,
            'difference' => $data['physical_balance'] - $ledgerBalance,
            'notes' => $data['notes'] ?? null,
            'status' => 'draft',
            'reconciled_by' => auth()->id()
        ]);

        return array_merge(['success' => true], $reconciliation->toArray());
    }
}

