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
        return response()->json([
            'success' => true,
            'vouchers' => $result['vouchers'],
            'total' => $result['total']
        ]);
    }

    /**
     * Show a single journal voucher details
     */
    public function show(string $id, ShowJournalVoucherAction $action): JsonResponse
    {
        try {
            PermissionService::requirePermission('journal_vouchers', 'view');
            return response()->json([
                'success' => true,
                'voucher' => $action->execute($id)
            ]);
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
            return $this->successResponse($action->execute($request->validated()));
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
