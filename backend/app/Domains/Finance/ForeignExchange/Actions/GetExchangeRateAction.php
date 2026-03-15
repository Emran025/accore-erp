<?php
namespace App\Domains\Finance\ForeignExchange\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\Finance\ForeignExchange\Services\CurrencyPolicyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetExchangeRateAction
{
    public function __construct(
        private readonly CurrencyPolicyService $policyService
    ) {}

    public function execute(array $data): ?array
    {
        $rate = $this->policyService->getExchangeRate(
            $data['source_currency_id'],
            $data['target_currency_id'],
            $data['date'] ?? null
        );

        if ($rate === null) {
            return null;
        }

        return [
            'source_currency_id' => $data['source_currency_id'],
            'target_currency_id' => $data['target_currency_id'],
            'rate' => $rate,
            'date' => $data['date'] ?? now()->format('Y-m-d'),
        ];
    }
}
