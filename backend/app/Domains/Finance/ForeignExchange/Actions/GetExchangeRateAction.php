<?php
namespace App\Domains\Finance\ForeignExchange\Actions;

use App\Domains\Finance\ForeignExchange\Services\CurrencyPolicyService;
use Illuminate\Support\Collection;
class GetExchangeRateAction
{
    public function __construct(
        private readonly CurrencyPolicyService $policyService
    ) {}

    public function execute(array $data): ?Collection
    {
        $rate = $this->policyService->getExchangeRate(
            $data['source_currency_id'],
            $data['target_currency_id'],
            $data['date'] ?? null
        );

        if ($rate === null) {
            return null;
        }

        return collect([
            'source_currency_id' => $data['source_currency_id'],
            'target_currency_id' => $data['target_currency_id'],
            'rate' => $rate,
            'date' => $data['date'] ?? now()->format('Y-m-d'),
        ]);
    }
}
