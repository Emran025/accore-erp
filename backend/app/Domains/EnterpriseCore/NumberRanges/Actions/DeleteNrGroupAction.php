<?php

namespace App\Domains\EnterpriseCore\NumberRanges\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\NumberRanges\Models\NrGroup;
use Illuminate\Http\JsonResponse;

class DeleteNrGroupAction extends Action
{
    public function __construct(private readonly int $groupId) {}

    public function __invoke(): JsonResponse
    {
        NrGroup::findOrFail($this->groupId)->delete();
        return $this->successResponse(['message' => 'تم حذف المجموعة']);
    }
}
