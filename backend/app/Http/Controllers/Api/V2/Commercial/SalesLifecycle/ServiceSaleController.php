<?php

namespace App\Http\Controllers\Api\V2\Commercial\SalesLifecycle;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Domains\Commercial\SalesLifecycle\Actions\CreateServiceSaleAction;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use App\Exceptions\BusinessLogicException;
use App\Http\Resources\Commercial\SalesLifecycle\InvoiceResource;
use App\Domains\Commercial\SalesLifecycle\Models\Invoice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;

/**
 * Handles service sale invoice creation (both cash and credit).
 * Mounted under /v2/services/sales.
 * No inventory impact — delegates to ServiceSaleService via action.
 */
class ServiceSaleController extends Controller
{
    use BaseApiController;

    /**
     * Create a new service sale invoice.
     * payment_type in payload determines cash vs credit flow.
     */
    public function store(Request $request, CreateServiceSaleAction $action): JsonResponse
    {
        $data = $request->validate([
            'payment_type'      => 'required|in:cash,credit',
            'customer_id'       => 'nullable|integer|exists:ar_customers,id',
            'amount_paid'       => 'nullable|numeric|min:0',
            'discount_amount'   => 'nullable|numeric|min:0',
            'invoice_number'    => 'nullable|string|max:50',
            'items'             => 'required|array|min:1',
            'items.*.service_id'=> 'required|integer|exists:products,id',
            'items.*.quantity'  => 'required|numeric|min:0.01',
            'items.*.unit_price'=> 'required|numeric|min:0',
            'items.*.description' => 'nullable|string',
        ]);

        $data['user_id'] = auth()->id() ?? session('user_id');

        try {
            $result  = $action->execute($data);
            TelescopeService::logOperation('CREATE', 'service_invoices', $result['id'], null, $data);

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
}
