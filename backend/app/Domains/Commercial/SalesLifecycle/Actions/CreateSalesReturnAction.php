<?php

namespace App\Domains\Commercial\SalesLifecycle\Actions;

use App\Domains\Commercial\SalesLifecycle\Services\SalesService;
use App\Domains\Commercial\SalesLifecycle\Models\SalesReturn;
class CreateSalesReturnAction
{
    public function __construct(private readonly SalesService $salesService) {}

    public function execute(array $data, int $userId): SalesReturn
    {
        $returnId = $this->salesService->createReturn(
            $data['invoice_id'],
            $data['items'],
            $data['reason'] ?? null,
            $userId
        );
 
        return SalesReturn::findOrFail($returnId);
    }
}
