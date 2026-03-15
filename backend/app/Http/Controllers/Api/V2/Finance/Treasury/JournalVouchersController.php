<?php

namespace App\Http\Controllers\Api\V2\Finance\Treasury;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Requests\Finance\Treasury\StoreJournalVoucherRequest;
use App\Http\Requests\Finance\Treasury\ListJournalVoucherRequest;
use App\Domains\Finance\Treasury\Actions\ListJournalVouchersAction;
use App\Domains\Finance\Treasury\Actions\CreateJournalVoucherAction;
use App\Domains\Finance\Treasury\Actions\ReverseJournalVoucherAction;
use App\Domains\Finance\Treasury\Actions\ShowJournalVoucherAction;
use App\Domains\Finance\Treasury\Actions\DeleteJournalVoucherAction;
use App\Domains\Finance\GeneralLedger\Services\LedgerService;
use App\Domains\Finance\Treasury\Actions\PostJournalVoucherAction;
use App\Http\Resources\Finance\Treasury\JournalVoucherResource;
use App\Domains\EnterpriseCore\IdentityAccess\Services\PermissionService;


class JournalVouchersController extends Controller
{
    use BaseApiController;

    /**
     * Get all journal vouchers (manual entries)
     */
    public function index(ListJournalVoucherRequest $request, ListJournalVouchersAction $action): JsonResponse
    {
        PermissionService::requirePermission('journal_vouchers', 'view');
        $result = $action->execute($request->all());
        $objects = array_map(fn($v) => (object)$v, $result['vouchers']);
        return $this->paginatedResponse(
            JournalVoucherResource::collection($objects),
            $result['total'] ?? count($result['vouchers']),
            1,
            15
        );
    }

    /**
     * Show a single journal voucher details
     */
    public function show(string $id, ShowJournalVoucherAction $action): JsonResponse
    {
        try {
            PermissionService::requirePermission('journal_vouchers', 'view');
            $voucher = $action->execute($id);
            return $this->successResponse(new JournalVoucherResource((object)$voucher));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Store a new manual journal voucher
     */
    public function store(StoreJournalVoucherRequest $request, CreateJournalVoucherAction $action): JsonResponse
    {
        try {
            PermissionService::requirePermission('journal_vouchers', 'create');
            $result = $action->execute($request->validated());
            return $this->successResponse(new JournalVoucherResource((object)$result));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Reverse (cancel) a journal voucher
     */
    public function destroy(string $id, ReverseJournalVoucherAction $action): JsonResponse
    {
        try {
            PermissionService::requirePermission('journal_vouchers', 'delete');
            $result = $action->execute($id);
            return $this->successResponse($result);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }


    /**
     * Post a journal voucher to General Ledger
     */
    public function post(string $id, PostJournalVoucherAction $action, LedgerService $ledgerService): JsonResponse
    {
        try {
            PermissionService::requirePermission('journal_vouchers', 'post');
            $result = $action->execute((int)$id, $ledgerService);
            return $this->successResponse($result);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Delete an unposted journal voucher
     */
    public function delete(string $id, DeleteJournalVoucherAction $action): JsonResponse
    {
        try {
            PermissionService::requirePermission('journal_vouchers', 'delete');
            $result = $action->execute((int)$id);
            return $this->successResponse($result);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }


    /**
     * Reverse (cancel) a journal voucher - Alias for destroy
     */
    public function reverse(string $id, ReverseJournalVoucherAction $action): JsonResponse
    {
        return $this->destroy($id, $action);
    }
}
