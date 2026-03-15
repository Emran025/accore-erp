<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrObject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateNrObjectAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly int $id
    ) {}

    public function __invoke(): JsonResponse
    {
        $object = NrObject::findOrFail($this->id);

        $this->request->validate([
            'name'          => 'sometimes|string|max:255',
            'name_en'       => 'nullable|string|max:255',
            'description'   => 'nullable|string|max:500',
            'number_length' => 'sometimes|integer|min:1|max:20',
            'prefix'        => 'nullable|string|max:10',
            'is_active'     => 'sometimes|boolean',
        ]);

        $object->update($this->request->only(['name', 'name_en', 'description', 'number_length', 'prefix', 'is_active']));

        return $this->successResponse(['message' => 'تم تحديث كائن الترقيم']);
    }
}
