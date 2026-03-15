<?php
namespace App\Domains\Finance\ForeignExchange\Actions;

use App\Domains\Finance\ForeignExchange\Services\CurrencyPolicyService;

class ConvertAmountAction
{
        public function __construct(
        private readonly CurrencyPolicyService $policyService
    ) {}

    public function execute(array $data): array
    {
        $result = $this->policyService->convert(
            $data['amount'],
            $data['source_currency_id'],
            $data['target_currency_id'],
            $data['date'] ?? null
        );

        return [
            'original_amount' => $data['amount'],
            'converted_amount' => $result['amount'],
            'exchange_rate' => $result['rate'],
            'source_currency_id' => $data['source_currency_id'],
            'target_currency_id' => $data['target_currency_id'],
        ];
    }
}
