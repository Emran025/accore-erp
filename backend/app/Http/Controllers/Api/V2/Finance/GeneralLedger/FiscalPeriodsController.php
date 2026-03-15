<?php

namespace App\Http\Controllers\Api\V2\Finance\GeneralLedger;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\GeneralLedger\StoreFiscalPeriodRequest;
use App\Http\Requests\Finance\GeneralLedger\FiscalPeriodIdRequest;
use App\Domains\Finance\GeneralLedger\Actions\ListFiscalPeriodsAction;
use App\Domains\Finance\GeneralLedger\Actions\CreateFiscalPeriodAction;
use App\Domains\Finance\GeneralLedger\Actions\CloseFiscalPeriodAction;
use App\Domains\Finance\GeneralLedger\Actions\LockFiscalPeriodAction;
use App\Domains\Finance\GeneralLedger\Actions\UnlockFiscalPeriodAction;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class FiscalPeriodsController extends Controller
{
    use BaseApiController;

    /**
     * Get all fiscal periods
     */
    public function index(ListFiscalPeriodsAction $action): JsonResponse
    {
        $result = $action->execute();
        return $this->successResponse($result);
    }

    /**
     * Create a new fiscal period
     */
    public function store(StoreFiscalPeriodRequest $request, CreateFiscalPeriodAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated());
            return $this->successResponse($result);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Close a fiscal period
     */
    public function close(FiscalPeriodIdRequest $request, CloseFiscalPeriodAction $action): JsonResponse
    {
        try {
            $result = $action->execute((int)$request->input('id'));
            return $this->successResponse($result);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Lock a fiscal period
     */
    public function lock(FiscalPeriodIdRequest $request, LockFiscalPeriodAction $action): JsonResponse
    {
        try {
            $result = $action->execute((int)$request->input('id'));
            return $this->successResponse($result);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    /**
     * Unlock a fiscal period
     */
    public function unlock(FiscalPeriodIdRequest $request, UnlockFiscalPeriodAction $action): JsonResponse
    {
        try {
            $result = $action->execute((int)$request->input('id'));
            return $this->successResponse($result);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
