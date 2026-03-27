<?php

namespace App\Domains\Finance\GeneralLedger\Actions;

use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use Illuminate\Support\Collection;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

/**
 * Single Action Class: Generate Trial Balance report.
 *
 * Extracted from: Finance/GeneralLedger/GeneralLedgerController@trialBalance
 * Domain: 03-Finance → GeneralLedger
 *
 * This is a READ-ONLY action and is low-risk for early migration.
 */
class GetTrialBalanceAction
{
    public function __construct(
        private readonly LedgerService $ledgerService
    ) {}

    public function execute(array $filters): Collection
    {
        PermissionService::requirePermission('general_ledger', 'view');
        $asOfDate = $filters['as_of_date'] ?? null;

        $data = $this->ledgerService->getTrialBalanceData($asOfDate);
        
        $items = array_map(function($acc) {
            return [
                'account_code' => $acc['account_code'],
                'account_name' => $acc['account_name'],
                'debit' => (float)$acc['debit_balance'],
                'credit' => (float)$acc['credit_balance'],
                'balance' => (float)($acc['debit_balance'] - $acc['credit_balance'])
            ];
        }, $data['accounts']);

        return collect([
            'items' => $items,
            'total_debit' => (float)$data['total_debits'],
            'total_credit' => (float)$data['total_credits'],
            'balance' => (float)($data['total_debits'] - $data['total_credits'])
        ]);
    }
}
