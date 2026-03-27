<?php

namespace App\Http\Controllers\Api\V2\Commercial\SalesLifecycle;

use App\Domains\Commercial\SalesLifecycle\Actions\ListSalesReturnsAction;
use App\Domains\Commercial\SalesLifecycle\Actions\CreateSalesReturnAction;
use App\Domains\Commercial\SalesLifecycle\Actions\ShowSalesReturnAction;
use App\Domains\Commercial\SalesLifecycle\Actions\SalesReturnsLedgerAction;
use App\Http\Requests\Commercial\SalesLifecycle\ListSalesReturnsRequest;
use App\Http\Requests\Commercial\SalesLifecycle\StoreSalesReturnRequest;
use App\Http\Requests\Commercial\SalesLifecycle\LedgerSalesReturnsRequest;
use App\Http\Resources\Commercial\SalesLifecycle\SalesReturnResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class SalesReturnController extends Controller
{
    use BaseApiController;
    
    /**
     * List all sales returns with pagination
     */
    public function index(ListSalesReturnsRequest $request, ListSalesReturnsAction $action): JsonResponse
    {
        $paginator = $action->execute($request->validated());

        return $this->successResponse(SalesReturnResource::collection($paginator));
    }

    /**
     * Create a new sales return
     */
    public function store(StoreSalesReturnRequest $request, CreateSalesReturnAction $action): JsonResponse
    {
        try {
            $userId = (int) (auth()->id() ?? session('user_id'));
            $return = $action->execute($request->validated(), $userId);
            return $this->successResponse(new SalesReturnResource($return), 'Sales return created successfully', 201);
        } catch (\Exception $e) {
            Log::error('Sales Return Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Get a single return with details
     */
    public function show(int $id, ShowSalesReturnAction $action): JsonResponse
    {
        try {
            $return = $action->execute($id);
            return $this->successResponse(new SalesReturnResource($return));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 404);
        }
    }

    /**
     * Unified returns ledger – all sales returns (cash + credit) across all customers.
     */
    public function ledger(LedgerSalesReturnsRequest $request, SalesReturnsLedgerAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated());
            return $this->successResponse($result);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }
}
