<?php

namespace App\Domains\EnterpriseCore\NumberRanges\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\NumberRanges\Models\NrGroup;
use App\Domains\EnterpriseCore\NumberRanges\Models\NrObject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateNrGroupAction extends Action
{
    public function __construct(
        private readonly Request $request,
        private readonly int $objectId
    ) {}

    public function __invoke(): JsonResponse
    {
        NrObject::findOrFail($this->objectId);

        $this->request->validate([
            'code'        => "required|string|max:20|unique:nr_groups,code,NULL,id,nr_object_id,{$this->objectId}",
            'name'        => 'required|string|max:255',
            'name_en'     => 'nullable|string|max:255',
            'description' => 'nullable|string|max:500',
        ]);

        $group = NrGroup::create([
            'nr_object_id' => $this->objectId,
            ...$this->request->only(['code', 'name', 'name_en', 'description']),
            'created_by' => $this->request->user()?->id,
        ]);

        return $this->successResponse([
            'id'      => $group->id,
            'message' => 'تم إنشاء المجموعة بنجاح',
        ]);
    }
}
