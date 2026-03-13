<?php

namespace App\Domains\DigitalPlatform\Automation\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\SupplyChain\Inventory\Models\Batch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShowBatchAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $batchId = $this->request->query('batch_id');
        $batch = Batch::with('items')->findOrFail($batchId);

        return $this->successResponse($batch->toArray());
    }
}
