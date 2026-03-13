<?php

namespace App\Http\Controllers\Api\V2\Finance\JournalVouchers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;
use App\Http\Requests\Finance\JournalVouchers\StoreJournalVoucherRequest;
use App\Domains\Finance\JournalVouchers\Actions\ListJournalVouchersAction;
use App\Domains\Finance\JournalVouchers\Actions\ShowJournalVoucherAction;
use App\Domains\Finance\JournalVouchers\Actions\CreateJournalVoucherAction;
use App\Domains\Finance\JournalVouchers\Actions\ReverseJournalVoucherAction;

class JournalVouchersController extends Controller
{
    use BaseApiController;

    /**
     * Get all journal vouchers (manual entries)
     */
    public function index(Request $request, ListJournalVouchersAction $action): JsonResponse
    {
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
            $action->execute($id);
            return $this->successResponse(['message' => 'Journal voucher reversed successfully']);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Placeholder for post action
     */
    public function post(string $id): JsonResponse
    {
        // Journal vouchers are posted automatically in this implementation
        return $this->successResponse(['message' => 'Voucher is already posted']);
    }
}
