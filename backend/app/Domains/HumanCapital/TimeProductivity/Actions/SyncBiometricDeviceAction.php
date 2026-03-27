<?php

namespace App\Domains\HumanCapital\TimeProductivity\Actions;

use App\Domains\HumanCapital\TimeProductivity\Models\BiometricDevice;
use App\Domains\HumanCapital\TimeProductivity\Models\BiometricSyncLog;
use App\Domains\HumanCapital\TimeProductivity\Models\AttendanceRecord;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;
use Exception;
use Illuminate\Support\Collection;

class SyncBiometricDeviceAction
{
    public function execute(int|string $id, array $records = []): Collection
    {
        $device = BiometricDevice::findOrFail($id);

        $syncLog = BiometricSyncLog::create([
            'device_id'    => $device->id,
            'sync_type'    => 'manual',
            'status'       => 'in_progress',
            'initiated_by' => auth()->id(),
            'started_at'   => now(),
        ]);

        $imported = 0;
        $failed = 0;

        if (!empty($records)) {
            foreach ($records as $record) {
                try {
                    $employee = Employee::where('employee_code', $record['employee_code'])->first();
                    if (!$employee) {
                        $failed++;
                        continue;
                    }

                    AttendanceRecord::updateOrCreate(
                        [
                            'employee_id'     => $employee->id,
                            'attendance_date' => $record['attendance_date'],
                        ],
                        [
                            'check_in'   => $record['check_in'],
                            'check_out'  => $record['check_out'] ?? null,
                            'status'     => 'present',
                            'source'     => 'biometric',
                            'created_by' => auth()->id(),
                        ]
                    );
                    $imported++;
                } catch (Exception $e) {
                    $failed++;
                }
            }
        }

        $syncLog->update([
            'records_imported' => $imported,
            'records_failed'   => $failed,
            'status'           => 'completed',
            'completed_at'     => now(),
        ]);

        $device->update([
            'last_sync_at'         => now(),
            'total_records_synced' => $device->total_records_synced + $imported,
            'status'               => 'online',
        ]);

        return collect([
            'log' => $syncLog->toArray(),
            'imported' => $imported,
            'failed' => $failed,
        ]);
    }
}
