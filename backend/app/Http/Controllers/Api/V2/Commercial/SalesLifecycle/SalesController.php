<?php

namespace App\Http\Controllers\Api\V2\Commercial\SalesLifecycle;

use App\Domains\Commercial\SalesLifecycle\Actions\ListInvoicesAction;
use App\Domains\Commercial\SalesLifecycle\Actions\CreateInvoiceAction;
use App\Domains\Commercial\SalesLifecycle\Actions\ShowInvoiceAction;
use App\Domains\Commercial\SalesLifecycle\Actions\DeleteInvoiceAction;
use App\Http\Requests\Commercial\SalesLifecycle\StoreInvoiceRequest;
use App\Http\Requests\Commercial\SalesLifecycle\ListInvoicesRequest;
use App\Http\Requests\Commercial\SalesLifecycle\ShowInvoiceRequest;
use App\Http\Requests\Commercial\SalesLifecycle\DeleteInvoiceRequest;
use App\Http\Requests\Commercial\SalesLifecycle\SubmitZatcaRequest;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use App\Exceptions\BusinessLogicException;
use App\Http\Resources\Commercial\SalesLifecycle\InvoiceResource;
use App\Domains\Commercial\SalesLifecycle\Models\Invoice;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use App\Domains\Finance\TaxCompliance\Actions\SubmitZatcaInvoiceAction;
use App\Domains\Finance\TaxCompliance\Actions\GetZatcaStatusAction;

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
        $paginated = $action->execute($request->validated());

        return $this->paginatedResponse(
            InvoiceResource::collection($paginated->items())->resolve(),
            $paginated->total(),
            $paginated->currentPage(),
            $paginated->perPage()
        );
    }

    /**
     * Store a new invoice.
     */
    public function store(StoreInvoiceRequest $request, CreateInvoiceAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $validated['user_id'] = auth()->id() ?? session('user_id');

            $result = $action->execute($validated);
            TelescopeService::logOperation('CREATE', 'invoices', $result['id'], null, $validated);

            $invoice = Invoice::findOrFail($result['id']);
            return $this->successResponse((new InvoiceResource($invoice))->resolve(), 'Invoice created successfully');
        } catch (BusinessLogicException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 400);
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Invoice not found after creation', 404);
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
    public function show(ShowInvoiceRequest $request, ShowInvoiceAction $action): JsonResponse
    {
        try {
            $invoice = $action->execute((int)$request->validated()['id']);
            return $this->successResponse(['data' => (new InvoiceResource($invoice))->resolve()]);
        } catch (ModelNotFoundException $e) {
            return $this->errorResponse('Invoice not found', 404);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 400);
        }
    }

    /**
     * Delete (void) an invoice.
     */
    public function destroy(DeleteInvoiceRequest $request, DeleteInvoiceAction $action): JsonResponse
    {
        try {
            $id = (int)$request->validated()['id'];
            $oldValues = $action->execute($id);
            TelescopeService::logOperation('DELETE', 'invoices', $id, $oldValues, null);

            return $this->successResponse([], 'Invoice deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Submit invoice to ZATCA.
     */
    public function submitZatca(SubmitZatcaRequest $request, int $id, SubmitZatcaInvoiceAction $action): JsonResponse
    {
        try {
            $submissionType = $request->validated()['submission_type'] ?? 'reporting';
            $result = $action->execute($id, $submissionType);
            
            return $this->successResponse($result, 'ZATCA submission processed');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }

    /**
     * Get ZATCA status for an invoice.
     */
    public function getZatcaStatus(int $id, GetZatcaStatusAction $action): JsonResponse
    {
        try {
            $result = $action->execute($id);
            return $this->successResponse($result);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 500);
        }
    }
}