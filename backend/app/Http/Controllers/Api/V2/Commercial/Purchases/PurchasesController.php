<?php

namespace App\Http\Controllers\Api\V2\Commercial\Purchases;

use App\Http\Requests\Commercial\Purchases\ListPurchasesRequest;
use App\Http\Requests\Commercial\Purchases\StorePurchaseRequest;
use App\Http\Requests\Commercial\Purchases\StorePurchaseReturnRequest;
use App\Http\Requests\Commercial\Purchases\StorePurchaseRequestRequest;
use App\Http\Requests\Commercial\Purchases\UpdatePurchaseRequestRequest;
use App\Http\Requests\Commercial\Purchases\ReturnsLedgerRequest;
use App\Domains\Commercial\Purchases\Actions\ListPurchasesAction;
use App\Domains\Commercial\Purchases\Actions\CreatePurchaseAction;
use App\Domains\Commercial\Purchases\Actions\ShowPurchaseAction;
use App\Domains\Commercial\Purchases\Actions\ApprovePurchaseAction;
use App\Domains\Commercial\Purchases\Actions\ReversePurchaseAction;
use App\Domains\Commercial\Purchases\Actions\PurchaseReturnsLedgerAction;
use App\Domains\Commercial\Purchases\Actions\CreatePurchaseReturnAction;
use App\Domains\Commercial\Purchases\Actions\ListPurchaseRequestsAction;
use App\Domains\Commercial\Purchases\Actions\CreatePurchaseRequestAction;
use App\Domains\Commercial\Purchases\Actions\UpdatePurchaseRequestAction;
use App\Domains\Commercial\Purchases\Actions\AutoGenerateRequestsAction;
use App\Domains\Commercial\Purchases\Models\Purchase;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use App\Http\Resources\PurchaseResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;


/**
 * Controller for managing Purchase operations via API.
 * Handles creation, approval, reversal, and purchase requests.
 */
class PurchasesController extends Controller
{
    use BaseApiController;

    /**
     * List all purchases with pagination and search.
     */
    public function index(ListPurchasesRequest $request, ListPurchasesAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());

        return $this->paginatedResponse(
            PurchaseResource::collection($result['data']),
            $result['total'],
            $result['current_page'],
            $result['per_page']
        );
    }

    /**
     * Store a new purchase or create a purchase return.
     */
    public function store(Request $request, CreatePurchaseAction $purchaseAction, CreatePurchaseReturnAction $returnAction): JsonResponse
    {
        $type = $request->input('type', 'purchase');
        $userId = (int) (auth()->id() ?? session('user_id'));

        if (!$userId) {
            return $this->errorResponse('User ID is required', 401);
        }

        try {
            if ($type === 'return') {
                $storeRequest = app(StorePurchaseReturnRequest::class);
                $validated = $storeRequest->validated();

                $returnId = $returnAction->execute($validated, $userId);
                TelescopeService::logOperation('CREATE', 'purchase_returns', $returnId, null, $validated);

                return $this->successResponse(['id' => $returnId], 'Purchase return created successfully');
            }

            // Standard Purchase
            $storeRequest = app(StorePurchaseRequest::class);
            $validated = $storeRequest->validated();

            $purchase = $purchaseAction->execute($validated, $userId);
            TelescopeService::logOperation('CREATE', 'purchases', $purchase['id'], null, $validated);

            return $this->successResponse($purchase, 'Purchase created successfully', 201);
        } catch (\Exception $e) {
            Log::error('Purchase Operation Error: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Get a single purchase or return details.
     */
    public function show(Request $request, ShowPurchaseAction $action): JsonResponse
    {
        $id = $request->input('id');
        if (!$id) {
            return $this->errorResponse('ID is required', 400);
        }

        $purchase = $action->execute((int)$id);
        $this->authorize('view', $purchase);

        return $this->successResponse(new PurchaseResource($purchase));
    }

    /**
     * List all purchase requests.
     */
    public function requests(ListPurchaseRequestsAction $action): JsonResponse
    {
        $result = $action->execute();
        return $this->successResponse($result);
    }

    /**
     * Store a new purchase request.
     */
    public function storeRequest(StorePurchaseRequestRequest $request, CreatePurchaseRequestAction $action): JsonResponse
    {
        $userId = (int) (auth()->id() ?? session('user_id'));
        $result = $action->execute($request->validated(), $userId);

        return $this->successResponse($result);
    }

    /**
     * Update a purchase request status.
     */
    public function updateRequest(UpdatePurchaseRequestRequest $request, UpdatePurchaseRequestAction $action): JsonResponse
    {
        $action->execute($request->validated());

        return $this->successResponse([], 'Purchase request updated successfully');
    }

    /**
     * Auto-generate purchase requests based on low stock
     */
    public function autoGenerateRequests(AutoGenerateRequestsAction $action): JsonResponse
    {
        $userId = auth()->id() ?? session('user_id');
        $result = $action->execute((int)$userId);
        
        TelescopeService::logOperation('BATCH_CREATE', 'purchase_requests', null, null, ['count' => $result['generated_count']]);

        return $this->successResponse($result, $result['message']);
    }

    /**
     * Approve a pending purchase.
     */
    public function approve(Request $request, ApprovePurchaseAction $action): JsonResponse
    {
        $id = $request->input('id');
        if (!$id) {
            return $this->errorResponse('ID is required', 400);
        }

        $purchase = Purchase::findOrFail($id);
        $this->authorize('approve', $purchase);
        
        $userId = auth()->id() ?? session('user_id');

        try {
            $success = $action->execute((int)$id, (int)$userId);
            
            if (!$success) {
                return $this->errorResponse('Purchase already approved or not found', 400);
            }

            TelescopeService::logOperation('UPDATE', 'purchases', $id, null, ['action' => 'approve']);

            return $this->successResponse(['message' => 'Purchase approved and processed successfully']);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Reverse (soft-delete) a purchase.
     */
    public function destroy(Request $request, ReversePurchaseAction $action): JsonResponse
    {
        $id = $request->input('id');
        if (!$id) {
            return $this->errorResponse('ID is required', 400);
        }

        $purchase = Purchase::findOrFail($id);
        $this->authorize('delete', $purchase);
        
        $userId = auth()->id() ?? session('user_id');

        try {
            $action->execute((int)$id, (int)$userId);
            TelescopeService::logOperation('REVERSE', 'purchases', $id, null, ['action' => 'reverse']);

            return $this->successResponse(['message' => 'Purchase reversed successfully']);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Unified purchase returns ledger.
     */
    public function returnsLedger(ReturnsLedgerRequest $request, PurchaseReturnsLedgerAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());

        return $this->successResponse($result);
    }
}