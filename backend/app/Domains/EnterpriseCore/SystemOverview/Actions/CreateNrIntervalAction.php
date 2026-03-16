<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Models\NrInterval;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrObject;
use App\Domains\EnterpriseCore\SystemOverview\Services\NumberRangeService;

class CreateNrIntervalAction
{
    public function __construct(private readonly NumberRangeService $service) {}

    public function execute(int $objectId, array $data, ?int $userId = null): NrInterval
    {
        $object = NrObject::findOrFail($objectId);

        $error = $this->service->validateRange($object, $data['from_number'], $data['to_number']);
        if ($error) {
            throw new \Exception($error);
        }

        if ($this->service->hasOverlap($objectId, $data['from_number'], $data['to_number'])) {
            throw new \Exception('النطاق يتداخل مع نطاق موجود');
        }

        return NrInterval::create([
            'nr_object_id' => $objectId,
            ...$data,
            'created_by' => $userId,
        ]);
    }
}
