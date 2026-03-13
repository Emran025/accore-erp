<?php

namespace App\Domains\DigitalPlatform\Automation\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\SupplyChain\Inventory\Models\Batch;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExecuteBatchAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $batchId = $this->request->input('batch_id');
        $batch = Batch::findOrFail($batchId);

        if ($batch->status !== 'pending') {
            return $this->errorResponse('الدفعات المعلقة فقط يمكن تنفيذها', 400);
        }

        $batch->update([
            'status' => 'processing',
            'started_at' => now(),
        ]);

        $batch->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        TelescopeService::logOperation('EXECUTE', 'batch_processing', $batchId, ['status' => 'pending'], ['status' => 'completed']);

        return $this->successResponse([], 'تم تنفيذ الدفعة بنجاح');
    }
}
