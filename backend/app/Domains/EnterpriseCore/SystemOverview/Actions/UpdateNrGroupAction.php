<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrGroup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateNrGroupAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly int $groupId
    ) {}

    public function __invoke(): JsonResponse
    {
        $group = NrGroup::findOrFail($this->groupId);

        $this->request->validate([
            'code'        => "sometimes|string|max:20|unique:nr_groups,code,{$this->groupId},id,nr_object_id,{$group->nr_object_id}",
            'name'        => 'sometimes|string|max:255',
            'name_en'     => 'nullable|string|max:255',
            'description' => 'nullable|string|max:500',
            'is_active'   => 'sometimes|boolean',
        ]);

        $group->update($this->request->only(['code', 'name', 'name_en', 'description', 'is_active']));

        return $this->successResponse(['message' => 'تم تحديث المجموعة']);
    }
}
