<?php

namespace App\Domains\Commercial\SalesLifecycle\Actions;

use App\Domains\Commercial\SalesLifecycle\Services\SalesService;

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
