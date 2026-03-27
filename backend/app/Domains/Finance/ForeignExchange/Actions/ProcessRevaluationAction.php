<?php
namespace App\Domains\Finance\ForeignExchange\Actions;

use App\Domains\Finance\ForeignExchange\Services\CurrencyPolicyService;
use Illuminate\Support\Collection;
class ProcessRevaluationAction
{
    public function __construct(
        private readonly CurrencyPolicyService $policyService
    ) {}

    public function execute(array $data): Collection
    {
        return collect($this->policyService->processRevaluation(
            $data['currency_id'],
            $data['new_rate'],
            $data['fiscal_period_id'] ?? null
        ));
    }
}
