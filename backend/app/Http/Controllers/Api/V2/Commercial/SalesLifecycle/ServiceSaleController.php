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
    ShowInvoiceRequest,
    DeleteServiceInvoiceRequest
};
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use App\Exceptions\BusinessLogicException;
use App\Http\Resources\Commercial\SalesLifecycle\InvoiceResource;
use App\Domains\Commercial\SalesLifecycle\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
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
        $paginated = $action->execute($request->validated());

        return $this->paginatedResponse(
            InvoiceResource::collection($paginated->items())->resolve(),
            $paginated->total(),
            $paginated->currentPage(),
            $paginated->perPage()
        );
    }

    /**
     * Show a single service invoice with full details.
     */
    public function show(ShowInvoiceRequest $request, ShowServiceInvoiceAction $action): JsonResponse
    {
        try {
            $invoice = $action->execute((int) $request->validated()['id']);
            return $this->successResponse(['data' => (new InvoiceResource($invoice))->resolve()]);
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Service invoice not found', 404);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Create a new service sale invoice.
     */
    public function store(StoreServiceSaleRequest $request, CreateServiceSaleAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $validated['user_id'] = auth()->id() ?? session('user_id');

            $result  = $action->execute($validated);
            TelescopeService::logOperation('CREATE', 'service_invoices', $result['id'], null, $validated);

            $invoice = Invoice::findOrFail($result['id']);
            return $this->successResponse(
                (new InvoiceResource($invoice))->resolve(),
                'Service invoice created successfully'
            );
        } catch (BusinessLogicException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 400);
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Invoice not found after creation', 404);
        } catch (\Exception $e) {
            Log::error('Service Sale Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);

            $businessKeywords = ['not available', 'required', 'customer'];
            foreach ($businessKeywords as $kw) {
                if (stripos($e->getMessage(), $kw) !== false) {
                    return $this->errorResponse($e->getMessage(), 400);
                }
            }

            return $this->errorResponse('System error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete a service sale invoice.
     */
    public function destroy(DeleteServiceInvoiceRequest $request, DeleteInvoiceAction $action): JsonResponse
    {
        try {
            $id = (int) $request->validated()['id'];
            $oldValues = $action->execute($id);
            TelescopeService::logOperation('DELETE', 'service_invoices', $id, $oldValues, null);

            return $this->successResponse(null, 'Service invoice deleted successfully');
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Service invoice not found', 404);
        } catch (BusinessLogicException $e) {
            return $this->errorResponse($e->getMessage(), 400);
        } catch (\Exception $e) {
            Log::error('Service Delete Error: ' . $e->getMessage());
            return $this->errorResponse('System error while deleting: ' . $e->getMessage(), 500);
        }
    }
}
