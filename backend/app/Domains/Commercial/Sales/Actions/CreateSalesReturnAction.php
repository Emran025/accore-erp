<?php

namespace App\Domains\Commercial\Sales\Actions;

use App\Domains\Commercial\Sales\Services\SalesService;

class CreateSalesReturnAction
{
    public function __construct(private readonly SalesService $salesService) {}

    public function execute(array $data, int $userId): array
    {
        $returnId = $this->salesService->createReturn(
            $data['invoice_id'],
            $data['items'],
            $data['reason'] ?? null,
            $userId
        );

        return ['id' => $returnId];
    }
}
