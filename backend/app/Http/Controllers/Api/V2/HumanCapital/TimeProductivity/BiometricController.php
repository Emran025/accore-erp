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

        return $this->successResponse(BiometricDeviceResource::collection($devices));
    }

    public function storeDevice(StoreBiometricDeviceRequest $request, CreateBiometricDeviceAction $action): JsonResponse
    {
        $validated = $request->validated();
        $device = $action->execute($validated);

        $model = BiometricDevice::find($device['id'] ?? $device);
        return $this->successResponse(new BiometricDeviceResource($model), 'Device registered');
    }

    public function updateDevice(UpdateBiometricDeviceRequest $request, $id, UpdateBiometricDeviceAction $action): JsonResponse
    {
        $validated = $request->validated();
        $device = $action->execute($id, $validated);

        $model = BiometricDevice::find($device['id'] ?? $id);
        return $this->successResponse(new BiometricDeviceResource($model), 'Device updated');
    }

    public function destroyDevice($id, DeleteBiometricDeviceAction $action): JsonResponse
    {
        $action->execute($id);
        return $this->successResponse([], 'Device removed');
    }

    // ── Sync Operations ──

    public function syncDevice(SyncBiometricDeviceRequest $request, $id, SyncBiometricDeviceAction $action): JsonResponse
    {
        $validated = $request->validated();
        $records = $validated['records'] ?? [];

        $result = $action->execute($id, $records);

        return $this->successResponse(
            $result['log'],
            "Sync complete: {$result['imported']} imported, {$result['failed']} failed"
        );
    }

    // ── Sync Logs ──

    public function syncLogs(Request $request, GetBiometricSyncLogsAction $action): JsonResponse
    {
        $filters = $request->only(['device_id']);
        $logs = $action->execute($filters);

        return $this->paginatedResponse(
            BiometricSyncLogResource::collection($logs['data']),
            $logs['total'],
            $logs['current_page'],
            $logs['per_page']
        );
    }

    public function importFromFile(ImportBiometricDeviceRequest $request, ImportBiometricAttendanceAction $action): JsonResponse
    {
        $validated = $request->validated();
        $file = $request->file('file');

        $result = $action->execute($validated['device_id'], $file);

        return $this->successResponse(
            $result['log'],
            "File import complete: {$result['imported']} imported, {$result['failed']} failed"
        );
    }
}
