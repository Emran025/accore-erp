<?php

namespace App\Http\Controllers\Api\V2\Finance\Treasury;

use App\Http\Controllers\Controller;
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
        $result = $action->execute($request->validated());

        return $this->paginatedResponse(
            JournalVoucherResource::collection($result['vouchers']),
            $result['total'],
            $result['page'],
            $result['per_page']
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
            return $this->successResponse(new JournalVoucherResource((object)$voucher->all()));
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
            $voucher = $action->execute($request->validated());
            return $this->successResponse(new JournalVoucherResource((object)$voucher->all()), 'Journal Voucher created successfully', 201);
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
            $voucher = $action->execute($id);
            return $this->successResponse(new JournalVoucherResource((object)$voucher->all()), 'Journal Voucher reversed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function post(string $id, PostJournalVoucherAction $action, LedgerService $ledgerService): JsonResponse
    {
        try {
            PermissionService::requirePermission('journal_vouchers', 'post');
            $voucher = $action->execute((int)$id, $ledgerService);
            return $this->successResponse(new JournalVoucherResource((object)$voucher->all()), 'Journal Voucher posted successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function delete(string $id, DeleteJournalVoucherAction $action): JsonResponse
    {
        try {
            PermissionService::requirePermission('journal_vouchers', 'delete');
            $action->execute((int)$id);
            return $this->successResponse([], 'Journal Voucher deleted successfully');
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
