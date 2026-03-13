<?php

namespace App\Http\Controllers\Api\V2\Commercial\Sales;

use App\Domains\Commercial\Sales\Actions\ListSalesReturnsAction;
use App\Domains\Commercial\Sales\Actions\CreateSalesReturnAction;
use App\Domains\Commercial\Sales\Actions\ShowSalesReturnAction;
use App\Domains\Commercial\Sales\Actions\SalesReturnsLedgerAction;
use App\Http\Requests\Commercial\Sales\ListSalesReturnsRequest;
use App\Http\Requests\Commercial\Sales\StoreSalesReturnRequest;
use App\Http\Requests\Commercial\Sales\LedgerSalesReturnsRequest;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use App\Http\Resources\SalesReturnResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Support\Facades\Log;

class SalesReturnController extends Controller
{
    use BaseApiController;
    
    /**
     * List all sales returns with pagination
     */
    public function index(ListSalesReturnsRequest $request, ListSalesReturnsAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());

        return $this->paginatedResponse(
            SalesReturnResource::collection($result['data']),
            $result['total'],
            $result['current_page'],
            $result['per_page']
        );
    }

    /**
     * Create a new sales return
     */
    public function store(StoreSalesReturnRequest $request, CreateSalesReturnAction $action): JsonResponse
    {
        $validated = $request->validated();
        $userId = auth()->id() ?? session('user_id');

        if (!$userId) {
            return $this->errorResponse('User ID is required', 401);
        }

        try {
            $result = $action->execute($validated, (int)$userId);
            TelescopeService::logOperation('CREATE', 'sales_returns', $result['id'], null, $validated);

            return $this->successResponse($result, 'Sales return created successfully');
        } catch (\Exception $e) {
            Log::error('Sales Return Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Get a single return with details
     */
    public function show(Request $request, ShowSalesReturnAction $action): JsonResponse
    {
        $id = $request->input('id');
        if (!$id) {
            return $this->errorResponse('ID is required', 400);
        }

        $return = $action->execute((int)$id);

        return $this->successResponse(new SalesReturnResource($return));
    }

    /**
     * Unified returns ledger – all sales returns (cash + credit) across all customers.
     */
    public function ledger(LedgerSalesReturnsRequest $request, SalesReturnsLedgerAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());

        return $this->successResponse($result);
    }
}
