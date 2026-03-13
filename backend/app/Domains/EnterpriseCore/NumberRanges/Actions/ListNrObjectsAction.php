<?php

namespace App\Domains\EnterpriseCore\NumberRanges\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\NumberRanges\Models\NrObject;
use Illuminate\Http\JsonResponse;

class ListNrObjectsAction extends Action
{
    public function __invoke(): JsonResponse
    {
        $objects = NrObject::withCount(['groups', 'intervals', 'assignments'])
            ->orderBy('name')
            ->get();

        return $this->successResponse(['data' => $objects->toArray()]);
    }
}
