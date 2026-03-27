<?php

namespace App\Http\Controllers\Api\V2\Commercial\SalesLifecycle;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Domains\Commercial\SalesLifecycle\Actions\{
    CreateServiceSaleAction,
    ListServiceInvoicesAction,
    ShowServiceInvoiceAction,
    DeleteInvoiceAction
};
use App\Http\Requests\Commercial\SalesLifecycle\{
    ListServiceInvoicesRequest,
    StoreServiceSaleRequest,
};
use App\Exceptions\BusinessLogicException;
use App\Http\Resources\Commercial\SalesLifecycle\InvoiceResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * Handles service sale invoice operations (both cash and credit).
 * Mounted under /v2/services/sales.
 * No inventory impact — delegates to ServiceSaleService via actions.
 */
class ServiceSaleController extends Controller
{
    use BaseApiController;

    /**
     * List service invoices with pagination.
     */
    public function index(ListServiceInvoicesRequest $request, ListServiceInvoicesAction $action): JsonResponse
    {
        $paginator = $action->execute($request->validated());

        return $this->successResponse(InvoiceResource::collection($paginator));
    }

    /**
     * Show a single service invoice with full details.
     */
    public function show(int $id, ShowServiceInvoiceAction $action): JsonResponse
    {
        try {
            $invoice = $action->execute($id);
            return $this->successResponse(new InvoiceResource($invoice));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 404);
        }
    }

    /**
     * Create a new service sale invoice.
     */
    public function store(StoreServiceSaleRequest $request, CreateServiceSaleAction $action): JsonResponse
    {
        try {
            $invoice = $action->execute($request->validated());
            return $this->successResponse(new InvoiceResource($invoice), 'Service invoice created successfully', 201);
        } catch (BusinessLogicException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 400);
        } catch (\Exception $e) {
            Log::error('Service Sale Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return $this->errorResponse('System error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete a service sale invoice.
     */
    public function destroy(int $id, DeleteInvoiceAction $action): JsonResponse
    {
        try {
            $action->execute($id);
            return $this->successResponse([], 'Service invoice deleted successfully');
        } catch (\Exception $e) {
            Log::error('Service Delete Error: ' . $e->getMessage());
            return $this->errorResponse('System error while deleting: ' . $e->getMessage(), 500);
        }
    }
}
