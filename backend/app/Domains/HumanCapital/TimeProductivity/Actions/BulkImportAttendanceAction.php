<?php

namespace App\Domains\HumanCapital\TimeProductivity\Actions;

use App\Domains\HumanCapital\TimeProductivity\Services\AttendanceService;
use Illuminate\Support\Collection;

class BulkImportAttendanceAction
{
    public function __construct(
        private readonly AttendanceService $attendanceService
    ) {}

    public function execute(array $records): Collection
    {
        $imported = $this->attendanceService->bulkImport($records);
        return collect($imported);
    }
}
