<?php

namespace App\Domains\DigitalPlatform\Automation\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\SupplyChain\Inventory\Models\Batch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListBatchesAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $page = $this->request->query('page', 1);
        $limit = $this->request->query('limit', 20);

        $batches = Batch::with('creator')
            ->orderBy('created_at', 'desc')
            ->paginate($limit, ['*'], 'page', $page);

        return $this->paginatedResponse(
            $batches->items(),
            $batches->total(),
            $batches->currentPage(),
            $batches->perPage()
        );
    }
}
