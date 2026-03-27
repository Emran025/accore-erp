<?php

namespace App\Http\Controllers\Api\V2\Commercial\SalesLifecycle;

use App\Domains\Commercial\SalesLifecycle\Actions\ListInvoicesAction;
use App\Domains\Commercial\SalesLifecycle\Actions\CreateInvoiceAction;
use App\Domains\Commercial\SalesLifecycle\Actions\ShowInvoiceAction;
use App\Domains\Commercial\SalesLifecycle\Actions\DeleteInvoiceAction;
use App\Http\Requests\Commercial\SalesLifecycle\StoreInvoiceRequest;
use App\Http\Requests\Commercial\SalesLifecycle\ListInvoicesRequest;
use App\Http\Requests\Commercial\SalesLifecycle\SubmitZatcaRequest;
use App\Exceptions\BusinessLogicException;
use App\Http\Resources\Commercial\SalesLifecycle\InvoiceResource;
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
        $paginator = $action->execute($request->validated());

        return $this->successResponse(InvoiceResource::collection($paginator));
    }

    /**
     * Store a new invoice.
     */
    public function store(StoreInvoiceRequest $request, CreateInvoiceAction $action): JsonResponse
    {
        try {
            $invoice = $action->execute($request->validated());
            return $this->successResponse(new InvoiceResource($invoice), 'Invoice created successfully', 201);
        } catch (BusinessLogicException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 400);
        } catch (\Exception $e) {
            Log::error('Invoice Creation Error: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return $this->errorResponse('System error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get a single invoice by ID.
     */
    public function show(int $id, ShowInvoiceAction $action): JsonResponse
    {
        try {
            $invoice = $action->execute($id);
            return $this->successResponse(new InvoiceResource($invoice));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 404);
        }
    }

    /**
     * Delete (void) an invoice.
     */
    public function destroy(int $id, DeleteInvoiceAction $action): JsonResponse
    {
        try {
            $action->execute($id);
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