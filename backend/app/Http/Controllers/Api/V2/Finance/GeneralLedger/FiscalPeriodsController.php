<?php

namespace App\Http\Controllers\Api\V2\Finance\GeneralLedger;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\GeneralLedger\StoreFiscalPeriodRequest;
use App\Domains\Finance\GeneralLedger\Actions\ListFiscalPeriodsAction;
use App\Domains\Finance\GeneralLedger\Actions\CreateFiscalPeriodAction;
use App\Domains\Finance\GeneralLedger\Actions\CloseFiscalPeriodAction;
use App\Domains\Finance\GeneralLedger\Actions\LockFiscalPeriodAction;
use App\Domains\Finance\GeneralLedger\Actions\UnlockFiscalPeriodAction;
use App\Http\Resources\Finance\GeneralLedger\FiscalPeriodResource;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class FiscalPeriodsController extends Controller
{
    use BaseApiController;

    public function index(ListFiscalPeriodsAction $action): JsonResponse
    {
        $periods = $action->execute();
        return $this->successResponse(FiscalPeriodResource::collection($periods)->resolve());
    }

    public function store(StoreFiscalPeriodRequest $request, CreateFiscalPeriodAction $action): JsonResponse
    {
        try {
            $period = $action->execute($request->validated());
            return $this->successResponse(new FiscalPeriodResource($period), 'Fiscal period created successfully', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function close(int $id, CloseFiscalPeriodAction $action): JsonResponse
    {
        try {
            $period = $action->execute($id);
            return $this->successResponse(new FiscalPeriodResource($period), 'Fiscal period closed successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function lock(int $id, LockFiscalPeriodAction $action): JsonResponse
    {
        try {
            $period = $action->execute($id);
            return $this->successResponse(new FiscalPeriodResource($period), 'Fiscal period locked successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }

    public function unlock(int $id, UnlockFiscalPeriodAction $action): JsonResponse
    {
        try {
            $period = $action->execute($id);
            return $this->successResponse(new FiscalPeriodResource($period), 'Fiscal period unlocked successfully');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 500);
        }
    }
}
