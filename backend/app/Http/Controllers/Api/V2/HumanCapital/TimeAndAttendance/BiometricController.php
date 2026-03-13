<?php

namespace App\Http\Controllers\Api\V2\HumanCapital\TimeAndAttendance;

use App\Http\Controllers\Controller;
use App\Http\Requests\HumanCapital\TimeAndAttendance\StoreBiometricDeviceRequest;
use App\Http\Requests\HumanCapital\TimeAndAttendance\UpdateBiometricDeviceRequest;
use App\Http\Requests\HumanCapital\TimeAndAttendance\SyncBiometricDeviceRequest;
use App\Http\Requests\HumanCapital\TimeAndAttendance\ImportBiometricDeviceRequest;
use App\Domains\HumanCapital\TimeAndAttendance\Actions\GetBiometricSyncLogsAction;
use App\Domains\HumanCapital\TimeAndAttendance\Actions\ImportBiometricAttendanceAction;
use App\Domains\HumanCapital\TimeAndAttendance\Actions\ListBiometricDevicesAction;
use App\Domains\HumanCapital\TimeAndAttendance\Actions\SyncBiometricDeviceAction;
use App\Domains\HumanCapital\TimeAndAttendance\Actions\UpdateBiometricDeviceAction;
use App\Domains\HumanCapital\TimeAndAttendance\Actions\CreateBiometricDeviceAction;
use App\Domains\HumanCapital\TimeAndAttendance\Actions\DeleteBiometricDeviceAction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class BiometricController extends Controller
{
    use BaseApiController;

    // ── Devices ──

    public function indexDevices(Request $request, ListBiometricDevicesAction $action): JsonResponse
    {
        $filters = $request->only(['status']);
        $devices = $action->execute($filters);

        return $this->successResponse($devices);
    }

    public function storeDevice(StoreBiometricDeviceRequest $request, CreateBiometricDeviceAction $action): JsonResponse
    {
        $validated = $request->validated();
        $device = $action->execute($validated);

        return $this->successResponse($device, 'Device registered');
    }

    public function updateDevice(UpdateBiometricDeviceRequest $request, $id, UpdateBiometricDeviceAction $action): JsonResponse
    {
        $validated = $request->validated();
        $device = $action->execute($id, $validated);

        return $this->successResponse($device, 'Device updated');
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

        return $this->successResponse($logs);
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
