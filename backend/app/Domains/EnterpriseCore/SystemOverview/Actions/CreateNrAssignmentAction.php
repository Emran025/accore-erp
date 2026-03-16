<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Models\NrGroup;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrGroupIntervalAssignment;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrInterval;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrObject;

class CreateNrAssignmentAction
{
    public function execute(int $objectId, array $data, ?int $userId = null): NrGroupIntervalAssignment
    {
        NrObject::findOrFail($objectId);

        $group = NrGroup::where('id', $data['nr_group_id'])->where('nr_object_id', $objectId)->first();
        $interval = NrInterval::where('id', $data['nr_interval_id'])->where('nr_object_id', $objectId)->first();

        if (!$group || !$interval) {
            throw new \Exception('المجموعة أو النطاق لا ينتميان لنفس كائن الترقيم');
        }

        $exists = NrGroupIntervalAssignment::where('nr_group_id', $data['nr_group_id'])
            ->where('nr_interval_id', $data['nr_interval_id'])
            ->exists();

        if ($exists) {
            throw new \Exception('هذا الربط موجود بالفعل');
        }

        return NrGroupIntervalAssignment::create([
            'nr_object_id'   => $objectId,
            'nr_group_id'    => $data['nr_group_id'],
            'nr_interval_id' => $data['nr_interval_id'],
            'created_by'     => $userId,
        ]);
    }
}
