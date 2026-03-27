<?php
namespace App\Domains\Finance\ForeignExchange\Actions;

use App\Domains\Finance\ForeignExchange\Models\CurrencyExchangeRateHistory;
use App\Domains\Finance\ForeignExchange\Services\CurrencyPolicyService;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;

class RecordExchangeRateAction
{
    public function __construct(
        private readonly CurrencyPolicyService $policyService
    ) {}

    public function execute(array $data): CurrencyExchangeRateHistory
    {
        PermissionService::requirePermission('currency', 'edit');

        $rate = $this->policyService->recordExchangeRate(
            $data['currency_id'],
            $data['target_currency_id'],
            $data['exchange_rate'],
            $data['effective_date'] ?? null,
            $data['source'] ?? 'MANUAL',
            $data['source_reference'] ?? null
        );

        return $rate->load(['currency', 'targetCurrency']);
    }
}
