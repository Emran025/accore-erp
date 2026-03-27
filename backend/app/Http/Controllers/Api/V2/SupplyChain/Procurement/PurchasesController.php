<?php

namespace App\Http\Controllers\Api\V2\SupplyChain\Procurement;

use App\Http\Requests\SupplyChain\Procurement\ListPurchasesRequest;
use App\Http\Requests\SupplyChain\Procurement\StorePurchaseRequest;
use App\Http\Requests\SupplyChain\Procurement\StorePurchaseReturnRequest;
use App\Http\Requests\SupplyChain\Procurement\StorePurchaseRequestRequest;
use App\Http\Requests\SupplyChain\Procurement\UpdatePurchaseRequestRequest;
use App\Http\Requests\SupplyChain\Procurement\ReturnsLedgerRequest;
use App\Http\Requests\SupplyChain\Procurement\ShowPurchaseRequest;
use App\Http\Requests\SupplyChain\Procurement\ApprovePurchaseRequest;
use App\Http\Requests\SupplyChain\Procurement\ReversePurchaseRequest;
use App\Domains\SupplyChain\Procurement\Actions\ListPurchasesAction;
use App\Domains\SupplyChain\Procurement\Actions\CreatePurchaseAction;
use App\Domains\SupplyChain\Procurement\Actions\ShowPurchaseAction;
use App\Domains\SupplyChain\Procurement\Actions\ApprovePurchaseAction;
use App\Domains\SupplyChain\Procurement\Actions\ReversePurchaseAction;
use App\Domains\SupplyChain\Procurement\Actions\PurchaseReturnsLedgerAction;
use App\Domains\SupplyChain\Procurement\Actions\CreatePurchaseReturnAction;
use App\Domains\SupplyChain\Procurement\Actions\ListPurchaseRequestsAction;
use App\Domains\SupplyChain\Procurement\Actions\CreatePurchaseRequestAction;
use App\Domains\SupplyChain\Procurement\Actions\UpdatePurchaseRequestAction;
use App\Domains\SupplyChain\Procurement\Actions\AutoGenerateRequestsAction;
use App\Domains\SupplyChain\Procurement\Models\Purchase;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use App\Http\Resources\SupplyChain\Procurement\PurchaseResource;
use App\Http\Resources\SupplyChain\Procurement\PurchaseRequestResource;
use App\Domains\SupplyChain\Procurement\Models\PurchaseRequest;
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
        $paginator = $action->execute($request->validated());

        return $this->successResponse(PurchaseResource::collection($paginator));
    }

    /**
     * Store a new purchase or create a purchase return.
     */
    public function store(
        Request $request,
        CreatePurchaseAction $purchaseAction,
        CreatePurchaseReturnAction $returnAction
    ): JsonResponse {
        $type = $request->input('type', 'purchase');
        $userId = (int) (auth()->id() ?? session('user_id'));

        try {
            if ($type === 'return') {
                $validated = app(StorePurchaseReturnRequest::class)->validated();
                $purchase = $returnAction->execute($validated, $userId);
                TelescopeService::logOperation('CREATE', 'purchase_returns', $purchase->id, null, $validated);
                return $this->successResponse(new PurchaseResource($purchase), 'Purchase return created successfully');
            }

            $validated = app(StorePurchaseRequest::class)->validated();
            $purchase = $purchaseAction->execute($validated, $userId);
            TelescopeService::logOperation('CREATE', 'purchases', $purchase->id, null, $validated);
            return $this->successResponse(new PurchaseResource($purchase), 'Purchase created successfully', 201);
        } catch (\Exception $e) {
            Log::error('Purchase Operation Error: ' . $e->getMessage());
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Get a single purchase or return details.
     */
    public function show(ShowPurchaseRequest $request, ShowPurchaseAction $action): JsonResponse
    {
        $id = (int)$request->validated()['id'];
        $purchase = $action->execute($id);
        $this->authorize('view', $purchase);

        return $this->successResponse(new PurchaseResource($purchase));
    }

    /**
     * List all purchase requests.
     */
    public function requests(ListPurchaseRequestsAction $action): JsonResponse
    {
        $result = $action->execute();
        return $this->successResponse(PurchaseRequestResource::collection($result));
    }

    /**
     * Store a new purchase request.
     */
    public function storeRequest(StorePurchaseRequestRequest $request, CreatePurchaseRequestAction $action): JsonResponse
    {
        $userId = (int) (auth()->id() ?? session('user_id'));
        $purchaseRequest = $action->execute($request->validated(), $userId);

        return $this->successResponse(new PurchaseRequestResource($purchaseRequest), 'Purchase request created successfully');
    }

    /**
     * Update a purchase request status.
     */
    public function updateRequest(UpdatePurchaseRequestRequest $request, UpdatePurchaseRequestAction $action): JsonResponse
    {
        $purchaseRequest = $action->execute($request->validated());

        return $this->successResponse(new PurchaseRequestResource($purchaseRequest), 'Purchase request updated successfully');
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
    public function approve(ApprovePurchaseRequest $request, ApprovePurchaseAction $action): JsonResponse
    {
        $id = (int)$request->validated()['id'];
        $userId = (int) (auth()->id() ?? session('user_id'));

        try {
            $purchase = $action->execute($id, $userId);
            TelescopeService::logOperation('UPDATE', 'purchases', $id, null, ['action' => 'approve']);
            return $this->successResponse(new PurchaseResource($purchase), 'Purchase approved and processed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Reverse (soft-delete) a purchase.
     */
    public function destroy(ReversePurchaseRequest $request, ReversePurchaseAction $action): JsonResponse
    {
        $id = (int)$request->validated()['id'];
        $userId = (int)(auth()->id() ?? session('user_id'));

        try {
            $purchase = $action->execute($id, $userId);
            TelescopeService::logOperation('REVERSE', 'purchases', $id, null, ['action' => 'reverse']);

            return $this->successResponse(new PurchaseResource($purchase), 'Purchase reversed successfully');
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