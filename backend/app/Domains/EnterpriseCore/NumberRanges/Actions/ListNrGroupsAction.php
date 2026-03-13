<?php

namespace App\Domains\EnterpriseCore\NumberRanges\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\NumberRanges\Models\NrGroup;
use Illuminate\Http\JsonResponse;

class ListNrGroupsAction extends Action
{
    public function __construct(private readonly int $objectId) {}

    public function __invoke(): JsonResponse
    {
        $groups = NrGroup::where('nr_object_id', $this->objectId)
            ->with('intervals')
            ->orderBy('code')
            ->get();

        return $this->successResponse(['data' => $groups->toArray()]);
    }
}
