<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\EnterpriseCore\SystemOverview\Models\NrInterval;

class DeleteNrIntervalAction
{
    public function execute(int $intervalId): bool
    {
        $interval = NrInterval::findOrFail($intervalId);

        if ($interval->current_number > 0) {
            throw new \Exception('لا يمكن حذف نطاق تم استخدامه — يمكنك تعطيله بدلاً من ذلك');
        }

        return $interval->delete();
    }
}
