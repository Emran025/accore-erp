<?php

namespace App\Http\Controllers\Api\V2\Commercial\Sales;

use App\Domains\Commercial\Sales\Actions\ListInvoicesAction;
use App\Domains\Commercial\Sales\Actions\CreateInvoiceAction;
use App\Domains\Commercial\Sales\Actions\ShowInvoiceAction;
use App\Domains\Commercial\Sales\Actions\DeleteInvoiceAction;
use App\Http\Requests\Commercial\Sales\StoreInvoiceRequest;
use App\Http\Requests\Commercial\Sales\ListInvoicesRequest;
use App\Domains\Commercial\Sales\Models\Invoice;
use App\Domains\DigitalPlatform\Automation\Services\TelescopeService;
use App\Exceptions\BusinessLogicException;
use App\Http\Resources\InvoiceResource;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Controller for managing sales invoices via API.
 * Handles pagination, authorization, and integrates with SalesService and TelescopeService.
 */
class SalesController extends Controller
{
    use BaseApiController;

    /**
     * List invoices with pagination and optional filtering.
     */
    public function index(ListInvoicesRequest $request, ListInvoicesAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());

        return $this->paginatedResponse(
            InvoiceResource::collection($result['data']),
            $result['total'],
            $result['current_page'],
            $result['per_page']
        );
    }

    /**
     * Store a new invoice.
     */
    public function store(StoreInvoiceRequest $request, CreateInvoiceAction $action): JsonResponse
    {
        $validated = $request->validated();
        $validated['user_id'] = auth()->id() ?? session('user_id');

        try {
            $result = $action->execute($validated);
            TelescopeService::logOperation('CREATE', 'invoices', $result['id'], null, $validated);

            return $this->successResponse($result, 'Invoice created successfully');
        } catch (BusinessLogicException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 400);
        } catch (ValidationException $e) {
            throw $e;
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Resource not found: ' . $e->getMessage(), 404);
        } catch (\Exception $e) {
            Log::error('Invoice Creation Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);

            $businessRuleKeywords = ['price violation', 'insufficient stock', 'inventory', 'required', 'mismatch', 'zatca'];
            foreach ($businessRuleKeywords as $keyword) {
                if (stripos($e->getMessage(), $keyword) !== false) {
                    return $this->errorResponse($e->getMessage(), 400);
                }
            }

            return $this->errorResponse('System error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get a single invoice by ID.
     */
    public function show(Request $request, ShowInvoiceAction $action): JsonResponse
    {
        $id = $request->input('id');
        if (!$id) {
            return $this->errorResponse('ID is required', 400);
        }

        $invoice = $action->execute((int)$id);
        $this->authorize('view', $invoice);

        return $this->successResponse(new InvoiceResource($invoice));
    }

    /**
     * Delete (void) an invoice.
     */
    public function destroy(Request $request, DeleteInvoiceAction $action): JsonResponse
    {
        $id = $request->input('id');
        if (!$id) {
            return $this->errorResponse('ID is required', 400);
        }

        try {
            $oldValues = $action->execute((int)$id);
            TelescopeService::logOperation('DELETE', 'invoices', $id, $oldValues, null);

            return $this->successResponse([], 'Invoice deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }
}