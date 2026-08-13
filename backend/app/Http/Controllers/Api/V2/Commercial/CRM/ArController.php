<?php

namespace App\Http\Controllers\Api\V2\Commercial\CRM;

use App\Domains\Commercial\CRM\Actions\ListCustomersAction;
use App\Domains\Commercial\CRM\Actions\CreateCustomerAction;
use App\Domains\Commercial\CRM\Actions\UpdateCustomerAction;
use App\Domains\Commercial\CRM\Actions\DeleteCustomerAction;
use App\Domains\Commercial\CRM\Actions\CustomerLedgerAction;
use App\Http\Requests\Commercial\CRM\ListCustomersRequest;
use App\Http\Requests\Commercial\CRM\StoreArCustomerRequest;
use App\Http\Requests\Commercial\CRM\UpdateCustomerRequest;
use App\Http\Requests\Commercial\CRM\DeleteCustomerRequest;
use App\Http\Requests\Commercial\CRM\CustomerLedgerRequest;
use App\Domains\EnterpriseCore\Automation\Services\TelescopeService;
use App\Http\Resources\Commercial\CRM\ArCustomerResource;
use App\Http\Resources\Commercial\RevenueReceivables\ArTransactionResource;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Controllers\Controller;

class ArController extends Controller
{
    use BaseApiController;

    /**
     * Get customers
     */
    public function customers(ListCustomersRequest $request, ListCustomersAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());
        $paginator = $result['paginator'];

        return $this->paginatedResponse(
            ArCustomerResource::collection($paginator),
            $paginator->total(),
            $paginator->currentPage(),
            $paginator->perPage()
        );
    }

    /**
     * Create customer
     */
    public function storeCustomer(StoreArCustomerRequest $request, CreateCustomerAction $action): JsonResponse
    {
        $validated = $request->validated();
        $userId = auth()->id() ?? session('user_id');

        try {
            $customer = $action->execute($validated, (int)$userId);
            TelescopeService::logOperation('CREATE', 'ar_customers', $customer->id, null, $validated);

            return $this->successResponse((new ArCustomerResource($customer))->resolve(), 'Customer created successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Update customer
     */
    public function updateCustomer(UpdateCustomerRequest $request, UpdateCustomerAction $action): JsonResponse
    {
        $validated = $request->validated();

        try {
            $result = $action->execute($validated);
            TelescopeService::logOperation('UPDATE', 'ar_customers', $result['model']->id, $result['old_values'], $validated);

            return $this->successResponse(new ArCustomerResource($result['model']), 'Customer updated successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Delete customer
     */
    public function destroyCustomer(DeleteCustomerRequest $request, DeleteCustomerAction $action): JsonResponse
    {
        try {
            $id = (int)$request->validated()['id'];
            $oldValues = $action->execute($id);
            TelescopeService::logOperation(
                'DELETE',
                'ar_customers',
                $id,
                $oldValues instanceof \Illuminate\Support\Collection ? $oldValues->all() : $oldValues,
                null,
            );

            return $this->successResponse([], 'Customer deleted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 400);
        }
    }

    /**
     * Customer ledger — financial stats derived from GL.
     */
    public function ledger(CustomerLedgerRequest $request, CustomerLedgerAction $action): JsonResponse
    {
        $result = $action->execute($request->validated());

        return $this->successResponse([
            'customer' => $result['customer'],
            'data' => ArTransactionResource::collection($result['data'])->resolve(),
            'stats' => $result['stats'],
            'pagination' => $result['pagination'],
        ]);
    }
}
