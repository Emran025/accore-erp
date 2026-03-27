<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\TimeProductivity;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\TimeProductivity\StoreBiometricDeviceRequest;
use App\Http\Requests\HumanCapital\TimeProductivity\UpdateBiometricDeviceRequest;
use App\Http\Requests\HumanCapital\TimeProductivity\SyncBiometricDeviceRequest;
use App\Http\Requests\HumanCapital\TimeProductivity\ImportBiometricDeviceRequest;
use App\Domains\HumanCapital\TimeProductivity\Actions\GetBiometricSyncLogsAction;
use App\Domains\HumanCapital\TimeProductivity\Actions\ImportBiometricAttendanceAction;
use App\Domains\HumanCapital\TimeProductivity\Actions\ListBiometricDevicesAction;
use App\Domains\HumanCapital\TimeProductivity\Actions\SyncBiometricDeviceAction;
use App\Domains\HumanCapital\TimeProductivity\Actions\UpdateBiometricDeviceAction;
use App\Domains\HumanCapital\TimeProductivity\Actions\CreateBiometricDeviceAction;
use App\Domains\HumanCapital\TimeProductivity\Actions\DeleteBiometricDeviceAction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\HumanCapital\TimeProductivity\BiometricDeviceResource;
use App\Http\Resources\HumanCapital\TimeProductivity\BiometricSyncLogResource;
use App\Domains\HumanCapital\TimeProductivity\Models\BiometricDevice;
use App\Domains\HumanCapital\TimeProductivity\Models\BiometricSyncLog;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class BiometricController extends Controller
{
    use BaseApiController;

    // ── Devices ──

    public function indexDevices(Request $request, ListBiometricDevicesAction $action): JsonResponse
    {
        $filters = $request->only(['status']);
        $devices = $action->execute($filters);

        return $this->successResponse(BiometricDeviceResource::collection($devices)->resolve());
    }

    public function storeDevice(StoreBiometricDeviceRequest $request, CreateBiometricDeviceAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $device = $action->execute($validated);
            return $this->successResponse((new BiometricDeviceResource($device))->resolve(), 'Device registered');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function updateDevice(UpdateBiometricDeviceRequest $request, $id, UpdateBiometricDeviceAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $device = $action->execute($id, $validated);
            return $this->successResponse((new BiometricDeviceResource($device))->resolve(), 'Device updated');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    public function destroyDevice($id, DeleteBiometricDeviceAction $action): JsonResponse
    {
        try {
            $action->execute($id);
            return $this->successResponse([], 'Device removed');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    // ── Sync Operations ──

    public function syncDevice(SyncBiometricDeviceRequest $request, $id, SyncBiometricDeviceAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $records = $validated['records'] ?? [];
            $result = $action->execute($id, $records);

            return $this->successResponse(
                $result['log'],
                "Sync complete: {$result['imported']} imported, {$result['failed']} failed"
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    // ── Sync Logs ──

    public function syncLogs(Request $request, GetBiometricSyncLogsAction $action): JsonResponse
    {
        $filters = $request->only(['device_id']);
        $paginator = $action->execute($filters);

        return $this->paginatedResponse(
            BiometricSyncLogResource::collection($paginator),
            $paginator->total(),
            $paginator->currentPage(),
            $paginator->perPage()
        );
    }

    public function importFromFile(ImportBiometricDeviceRequest $request, ImportBiometricAttendanceAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $file = $request->file('file');
            $result = $action->execute($validated['device_id'], $file);

            return $this->successResponse(
                $result['log'],
                "File import complete: {$result['imported']} imported, {$result['failed']} failed"
            );
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }
}
