<?php

namespace App\Http\Controllers\Api\V2\EnterpriseCore\SystemOverview;

use App\Http\Controllers\Controller;
use App\Domains\EnterpriseCore\SystemOverview\Actions\ListNrObjectsAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\ShowNrObjectAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\ShowNrObjectByTypeAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\CreateNrObjectAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\UpdateNrObjectAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\DeleteNrObjectAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\ListNrGroupsAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\CreateNrGroupAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\UpdateNrGroupAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\DeleteNrGroupAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\ListNrIntervalsAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\CreateNrIntervalAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\UpdateNrIntervalAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\DeleteNrIntervalAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\ListNrAssignmentsAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\CreateNrAssignmentAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\DeleteNrAssignmentAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\GetNrFullnessReportAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\ExpandNrIntervalAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\ListNrExpansionLogsAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\GetNextNumberAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\PreviewNextNumberAction;
use App\Domains\EnterpriseCore\SystemOverview\Actions\GetNrSystemSummaryAction;
use App\Http\Requests\EnterpriseCore\SystemOverview\ExpandNrIntervalRequest;
use App\Http\Requests\EnterpriseCore\SystemOverview\GetNextNumberRequest;
use App\Http\Requests\EnterpriseCore\SystemOverview\StoreNrIntervalRequest;
use App\Http\Requests\EnterpriseCore\SystemOverview\StoreNrObjectRequest;
use App\Http\Requests\EnterpriseCore\SystemOverview\UpdateNrObjectRequest;
use App\Http\Requests\EnterpriseCore\SystemOverview\StoreNrGroupRequest;
use App\Http\Requests\EnterpriseCore\SystemOverview\UpdateNrGroupRequest;
use App\Http\Requests\EnterpriseCore\SystemOverview\UpdateNrIntervalRequest;
use App\Http\Requests\EnterpriseCore\SystemOverview\StoreNrAssignmentRequest;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrObject;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrGroup;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrInterval;
use App\Http\Resources\EnterpriseCore\SystemOverview\NrObjectResource;
use App\Http\Resources\EnterpriseCore\SystemOverview\NrGroupResource;
use App\Http\Resources\EnterpriseCore\SystemOverview\NrIntervalResource;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Api\V2\Shared\BaseApiController;

class NumberRangeController extends Controller
{
    use BaseApiController;

    /**
     * NumberRangeController Constructor.
     */
    public function __construct()
    {
    }

    // ══════════════════════════════════════════════════════════════
    //  NR Objects
    // ══════════════════════════════════════════════════════════════

    /**
     * List all NR Objects (summary view).
     */
    public function indexObjects(ListNrObjectsAction $action): JsonResponse
    {
        $objects = $action->execute();
        return $this->successResponse(NrObjectResource::collection($objects));
    }

    /**
     * Get full detail for a single NR Object.
     */
    public function showObject(int $id, ShowNrObjectAction $action): JsonResponse
    {
        try {
            $data = $action->execute($id);
            $object = NrObject::find($id);
            return $this->successResponse(new NrObjectResource($object));
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 404);
        }
    }

    /**
     * Get full detail for a NR Object by its object_type key.
     */
    public function showObjectByType(string $objectType, ShowNrObjectByTypeAction $action): JsonResponse
    {
        $data = $action->execute($objectType);
        if (!$data) {
            return $this->errorResponse('نوع الكائن غير موجود', 404);
        }
        $object = NrObject::where('object_type', $objectType)->first();
        return $this->successResponse(new NrObjectResource($object));
    }

    /**
     * Create a new NR Object.
     */
    public function storeObject(StoreNrObjectRequest $request, CreateNrObjectAction $action): JsonResponse
    {
        $result = $action->execute($request->validated(), $request->user()?->id);
        $object = NrObject::find($result['id'] ?? $result);
        return $this->successResponse(new NrObjectResource($object), 'تم إنشاء كائن التارقِيم بنجاح', 201);
    }

    /**
     * Update an NR Object.
     */
    public function updateObject(UpdateNrObjectRequest $request, int $id, UpdateNrObjectAction $action): JsonResponse
    {
        $action->execute($id, $request->validated());
        $object = NrObject::find($id);
        return $this->successResponse(new NrObjectResource($object), 'تم تحديث كائن الترقيم');
    }

    /**
     * Delete an NR Object.
     */
    public function destroyObject(int $id, DeleteNrObjectAction $action): JsonResponse
    {
        $action->execute($id);
        return $this->successResponse(['message' => 'تم حذف كائن الترقيم']);
    }

    // ══════════════════════════════════════════════════════════════
    //  NR Groups
    // ══════════════════════════════════════════════════════════════

    /**
     * List groups for an object.
     */
    public function indexGroups(int $objectId, ListNrGroupsAction $action): JsonResponse
    {
        $groups = $action->execute($objectId);
        return $this->successResponse(NrGroupResource::collection($groups));
    }

    /**
     * Create a group under an object.
     */
    public function storeGroup(StoreNrGroupRequest $request, int $objectId, CreateNrGroupAction $action): JsonResponse
    {
        try {
            $result = $action->execute($objectId, $request->validated(), $request->user()?->id);
            $group = NrGroup::find($result['id'] ?? $result);
            return $this->successResponse(new NrGroupResource($group), 'تم إنشاء المجموعة بنجاح', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Update a group.
     */
    public function updateGroup(UpdateNrGroupRequest $request, int $groupId, UpdateNrGroupAction $action): JsonResponse
    {
        try {
            $action->execute($groupId, $request->validated());
            $group = NrGroup::find($groupId);
            return $this->successResponse(new NrGroupResource($group), 'تم تحديث المجموعة');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Delete a group.
     */
    public function destroyGroup(int $groupId, DeleteNrGroupAction $action): JsonResponse
    {
        try {
            $action->execute($groupId);
            return $this->successResponse(['message' => 'تم حذف المجموعة']);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  NR Intervals
    // ══════════════════════════════════════════════════════════════

    /**
     * List intervals for an object.
     */
    public function indexIntervals(int $objectId, ListNrIntervalsAction $action): JsonResponse
    {
        $intervals = $action->execute($objectId);
        return $this->successResponse(NrIntervalResource::collection($intervals));
    }

    /**
     * Create an interval under an object.
     */
    public function storeInterval(StoreNrIntervalRequest $request, int $objectId, CreateNrIntervalAction $action): JsonResponse
    {
        try {
            $result = $action->execute($objectId, $request->validated(), $request->user()?->id);
            $interval = NrInterval::find($result['id'] ?? $result);
            return $this->successResponse(new NrIntervalResource($interval), 'تم إنشاء نطاق الأرقام بنجاح', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Update an interval.
     */
    public function updateInterval(UpdateNrIntervalRequest $request, int $intervalId, UpdateNrIntervalAction $action): JsonResponse
    {
        try {
            $action->execute($intervalId, $request->validated());
            $interval = NrInterval::find($intervalId);
            return $this->successResponse(new NrIntervalResource($interval), 'تم تحديث نطاق الأرقام');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Delete an interval.
     */
    public function destroyInterval(int $intervalId, DeleteNrIntervalAction $action): JsonResponse
    {
        try {
            $action->execute($intervalId);
            return $this->successResponse(['message' => 'تم حذف نطاق الأرقام']);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  Assignments (Group ↔ Interval)
    // ══════════════════════════════════════════════════════════════

    /**
     * List assignments for an object.
     */
    public function indexAssignments(int $objectId, ListNrAssignmentsAction $action): JsonResponse
    {
        $assignments = $action->execute($objectId);
        return $this->successResponse($assignments);
    }

    /**
     * Create an assignment.
     */
    public function storeAssignment(StoreNrAssignmentRequest $request, int $objectId, CreateNrAssignmentAction $action): JsonResponse
    {
        try {
            $result = $action->execute($objectId, $request->validated(), $request->user()?->id);
            return $this->successResponse($result, 'تم الربط بنجاح', 201);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Delete an assignment.
     */
    public function destroyAssignment(int $assignmentId, DeleteNrAssignmentAction $action): JsonResponse
    {
        try {
            $action->execute($assignmentId);
            return $this->successResponse(['message' => 'تم حذف الربط']);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    // ══════════════════════════════════════════════════════════════
    //  Domain Fullness & Expansion
    // ══════════════════════════════════════════════════════════════

    /**
     * Get fullness report for all intervals of an object.
     */
    public function fullnessReport(int $objectId, GetNrFullnessReportAction $action): JsonResponse
    {
        $report = $action->execute($objectId);
        return $this->successResponse(['data' => $report]);
    }

    /**
     * Expand an interval's upper boundary.
     */
    public function expandInterval(ExpandNrIntervalRequest $request, int $intervalId, ExpandNrIntervalAction $action): JsonResponse
    {
        try {
            $intervalData = $action->execute($intervalId, $request->validated(), $request->user()?->id);
            $interval = NrInterval::find($intervalId);
            return $this->successResponse(new NrIntervalResource($interval), 'تم توسيع النطاق بنجاح');
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Get expansion logs for an interval.
     */
    public function expansionLogs(int $intervalId, ListNrExpansionLogsAction $action): JsonResponse
    {
        $logs = $action->execute($intervalId);
        return $this->successResponse(['data' => $logs]);
    }

    // ══════════════════════════════════════════════════════════════
    //  Next Number (for consumption by other modules)
    // ══════════════════════════════════════════════════════════════

    /**
     * Generate next number for a group.
     */
    public function getNextNumber(GetNextNumberRequest $request, GetNextNumberAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $number = $action->execute($validated['object_id'], $validated['group_id']);
            return $this->successResponse([
                'number'  => $number,
                'message' => 'تم توليد الرقم بنجاح',
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * Preview the next number without consuming it.
     */
    public function previewNextNumber(GetNextNumberRequest $request, PreviewNextNumberAction $action): JsonResponse
    {
        try {
            $validated = $request->validated();
            $number = $action->execute($validated['object_id'], $validated['group_id']);
            return $this->successResponse([
                'number'  => $number,
                'message' => 'معاينة الرقم التالي',
            ]);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }
    }

    /**
     * System-wide summary of all NR objects.
     */
    public function systemSummary(GetNrSystemSummaryAction $action): JsonResponse
    {
        $summary = $action->execute();
        return $this->successResponse(['data' => $summary]);
    }
}