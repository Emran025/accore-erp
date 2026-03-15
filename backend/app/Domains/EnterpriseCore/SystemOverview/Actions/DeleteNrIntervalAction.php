<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrInterval;
use Illuminate\Http\JsonResponse;

class DeleteNrIntervalAction extends Action
{
    public function __construct(private readonly int $intervalId) {}

    public function __invoke(): JsonResponse
    {
        $interval = NrInterval::findOrFail($this->intervalId);

        if ($interval->current_number > 0) {
            return $this->errorResponse('لا يمكن حذف نطاق تم استخدامه — يمكنك تعطيله بدلاً من ذلك');
        }

        $interval->delete();
        return $this->successResponse(['message' => 'تم حذف نطاق الأرقام']);
    }
}
