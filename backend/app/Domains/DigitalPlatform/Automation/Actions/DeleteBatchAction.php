<?php

namespace App\Domains\DigitalPlatform\Automation\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\SupplyChain\Inventory\Models\Batch;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeleteBatchAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $id = $this->request->query('id') ?? $this->request->input('id');
        $batch = Batch::findOrFail($id);

        if ($batch->status === 'processing') {
            return $this->errorResponse('لا يمكن حذف دفعة قيد المعالجة', 400);
        }

        $oldValues = $batch->toArray();
        $batch->delete();

        TelescopeService::logOperation('DELETE', 'batch_processing', $id, $oldValues, null);

        return $this->successResponse([], 'تم حذف الدفعة بنجاح');
    }
}
