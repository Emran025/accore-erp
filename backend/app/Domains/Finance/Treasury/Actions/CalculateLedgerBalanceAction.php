<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class CalculateLedgerBalanceAction
{
    public function __construct(protected LedgerService $ledgerService) {}

    public function execute(array $filters): array
    {
        PermissionService::requirePermission('reconciliations', 'view');

        $date = $filters['date'] ?? now()->format('Y-m-d');
        $accountCode = $filters['account_code'] ?? '1110';
        $balance = $this->ledgerService->getAccountBalance($accountCode, $date);
        
        return [
            'ledger_balance' => $balance
        ];
    }
}
