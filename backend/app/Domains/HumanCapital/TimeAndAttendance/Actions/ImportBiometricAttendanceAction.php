<?php

namespace App\Domains\HumanCapital\TimeAndAttendance\Actions;

use App\Domains\HumanCapital\TimeAndAttendance\Models\BiometricDevice;
use App\Domains\HumanCapital\TimeAndAttendance\Models\BiometricSyncLog;
use App\Domains\HumanCapital\TimeAndAttendance\Models\AttendanceRecord;
use Illuminate\Http\UploadedFile;

class ImportBiometricAttendanceAction
{
    public function execute(int|string $deviceId, UploadedFile $file): array
    {
        $device = BiometricDevice::findOrFail($deviceId);

        $syncLog = BiometricSyncLog::create([
            'device_id'    => $device->id,
            'sync_type'    => 'import',
            'status'       => 'in_progress',
            'initiated_by' => auth()->id(),
            'started_at'   => now(),
        ]);

        $imported = 0;
        $failed = 0;

        if (($handle = fopen($file->getPathname(), 'r')) !== false) {
            $header = fgetcsv($handle);
            while (($row = fgetcsv($handle)) !== false) {
                try {
                    if (count($row) < 3) { $failed++; continue; }

                    $employee = \App\Domains\HumanCapital\WorkforceAdmin\Models\Employee::where('employee_code', trim($row[0]))->first();
                    if (!$employee) { $failed++; continue; }

                    AttendanceRecord::updateOrCreate(
                        [
                            'employee_id'     => $employee->id,
                            'attendance_date' => trim($row[1]),
                        ],
                        [
                            'check_in'   => trim($row[2]),
                            'check_out'  => isset($row[3]) ? trim($row[3]) : null,
                            'status'     => 'present',
                            'source'     => 'biometric',
                            'created_by' => auth()->id(),
                        ]
                    );
                    $imported++;
                } catch (\Exception $e) {
                    $failed++;
                }
            }
            fclose($handle);
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
        ]);

        return [
            'log' => $syncLog->toArray(),
            'imported' => $imported,
            'failed' => $failed,
        ];
    }
}
