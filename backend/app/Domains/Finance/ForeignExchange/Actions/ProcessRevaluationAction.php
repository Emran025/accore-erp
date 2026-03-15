<?php
namespace App\Domains\Finance\ForeignExchange\Actions;

use App\Domains\Finance\ForeignExchange\Services\CurrencyPolicyService;

class ProcessRevaluationAction
{
    public function __construct(
        private readonly CurrencyPolicyService $policyService
    ) {}

    public function execute(array $data): array
    {
        return $this->policyService->processRevaluation(
            $data['currency_id'],
            $data['new_rate'],
            $data['fiscal_period_id'] ?? null
        );
    }
}
