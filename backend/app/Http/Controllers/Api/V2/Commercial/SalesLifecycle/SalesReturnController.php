<?php

namespace App\Http\Controllers\Api\V2\Commercial\SalesLifecycle;

use App\Domains\Commercial\SalesLifecycle\Actions\ListSalesReturnsAction;
use App\Domains\Commercial\SalesLifecycle\Actions\CreateSalesReturnAction;
use App\Domains\Commercial\SalesLifecycle\Actions\ShowSalesReturnAction;
use App\Domains\Commercial\SalesLifecycle\Actions\SalesReturnsLedgerAction;
use App\Http\Requests\Commercial\SalesLifecycle\ListSalesReturnsRequest;
use App\Http\Requests\Commercial\SalesLifecycle\StoreSalesReturnRequest;
use App\Http\Requests\Commercial\SalesLifecycle\ShowSalesReturnRequest;
use App\Http\Requests\Commercial\SalesLifecycle\LedgerSalesReturnsRequest;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use App\Http\Resources\Commercial\SalesLifecycle\SalesReturnResource;
use App\Domains\Commercial\SalesLifecycle\Models\SalesReturn;
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
        $paginated = $action->execute($request->validated());

        return $this->paginatedResponse(
            SalesReturnResource::collection($paginated->items())->resolve(),
            $paginated->total(),
            $paginated->currentPage(),
            $paginated->perPage()
        );
    }

    /**
     * Create a new sales return
     */
    public function store(StoreSalesReturnRequest $request, CreateSalesReturnAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $userId = auth()->id() ?? session('user_id');

            if (!$userId) {
                return $this->errorResponse('User ID is required', 401);
            }

            $result = $action->execute($validated, (int)$userId);
            TelescopeService::logOperation('CREATE', 'sales_returns', $result['id'], null, $validated);

            $return = SalesReturn::findOrFail($result['id']);
            return $this->successResponse((new SalesReturnResource($return))->resolve(), 'Sales return created successfully');
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
    public function show(ShowSalesReturnRequest $request, ShowSalesReturnAction $action): JsonResponse
    {
        try {
            $return = $action->execute((int)$request->validated()['id']);
            return $this->successResponse((new SalesReturnResource($return))->resolve());
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Sales return not found', 404);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
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
