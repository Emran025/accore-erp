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
use App\Domains\Finance\GeneralLedger\Models\FiscalPeriod;
use App\Http\Resources\Finance\GeneralLedger\FiscalPeriodResource;
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
        $data = $result['data'] ?? $result;
        
        return $this->successResponse(FiscalPeriodResource::collection($data));
    }

    /**
     * Create a new fiscal period
     */
    public function store(StoreFiscalPeriodRequest $request, CreateFiscalPeriodAction $action): JsonResponse
    {
        try {
            $result = $action->execute($request->validated());
            $period = FiscalPeriod::find($result['id'] ?? $result);
            return $this->successResponse(new FiscalPeriodResource($period), 'Fiscal period created successfully', 201);
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
            $id = (int)$request->input('id');
            $result = $action->execute($id);
            $period = FiscalPeriod::find($result['id'] ?? $id);
            return $this->successResponse(new FiscalPeriodResource($period));
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
            $id = (int)$request->input('id');
            $result = $action->execute($id);
            $period = FiscalPeriod::find($result['id'] ?? $id);
            return $this->successResponse(new FiscalPeriodResource($period));
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
            $id = (int)$request->input('id');
            $result = $action->execute($id);
            $period = FiscalPeriod::find($result['id'] ?? $id);
            return $this->successResponse(new FiscalPeriodResource($period));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
