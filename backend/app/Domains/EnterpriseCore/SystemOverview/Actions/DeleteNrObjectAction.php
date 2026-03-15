<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrObject;
use Illuminate\Http\JsonResponse;

class DeleteNrObjectAction extends Action
{
    public function __construct(private readonly int $id) {}

    public function __invoke(): JsonResponse
    {
        $object = NrObject::findOrFail($this->id);
        $object->delete();

        return $this->successResponse(['message' => 'تم حذف كائن الترقيم']);
    }
}
