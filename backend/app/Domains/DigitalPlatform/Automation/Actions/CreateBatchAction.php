<?php

namespace App\Domains\DigitalPlatform\Automation\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\SupplyChain\Inventory\Models\Batch;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateBatchAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'batch_name' => 'required|string|max:100',
            'batch_type' => 'required|string|max:50',
            'description' => 'nullable|string',
        ]);

        $batch = Batch::create([
            'batch_name' => $validated['batch_name'],
            'batch_type' => $validated['batch_type'],
            'description' => $validated['description'],
            'status' => 'pending',
            'total_items' => 0,
            'created_by' => auth()->id() ?? session('user_id'),
        ]);

        TelescopeService::logOperation('CREATE', 'batch_processing', $batch->id, null, $validated);

        return $this->successResponse($batch->toArray());
    }
}
