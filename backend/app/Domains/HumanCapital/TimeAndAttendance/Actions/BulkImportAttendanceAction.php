<?php

namespace App\Domains\HumanCapital\TimeAndAttendance\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\TimeAndAttendance\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BulkImportAttendanceAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly AttendanceService $attendanceService
    ) {}

    public function __invoke(): JsonResponse
    {
        $validated = $this->request->validate([
            'records' => 'required|array',
            'records.*.employee_id' => 'required|exists:employees,id',
            'records.*.date' => 'required|date',
            'records.*.check_in' => 'nullable|date_format:H:i',
            'records.*.check_out' => 'nullable|date_format:H:i',
            'records.*.status' => 'nullable|in:present,absent,leave,holiday,weekend'
        ]);

        try {
            $imported = $this->attendanceService->bulkImport($validated['records']);
            return response()->json(['message' => 'Import successful', 'imported' => $imported], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}
