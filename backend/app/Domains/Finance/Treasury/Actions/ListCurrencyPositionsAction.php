<?php

namespace App\Domains\Finance\Treasury\Actions;

use App\Domains\Finance\GeneralLedger\Services\MultiCurrencyLedgerService;

class ListCurrencyPositionsAction
{
    public function __construct(
        private readonly MultiCurrencyLedgerService $ledgerService
    ) {
    }

    /**
     * @param array{currency_id?: int|null, as_of_date?: string|null} $filters
     */
    public function execute(array $filters): array
    {
        return $this->ledgerService->getMultiCurrencyTrialBalance(
            $filters['currency_id'] ?? null,
            $filters['as_of_date'] ?? null
        );
    }
}

