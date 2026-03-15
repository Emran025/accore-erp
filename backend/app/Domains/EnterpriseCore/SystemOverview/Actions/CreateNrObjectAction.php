<?php

namespace App\Domains\EnterpriseCore\SystemOverview\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrObject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateNrObjectAction extends Action
{
    public function __construct(private readonly Request $request) {}

    public function __invoke(): JsonResponse
    {
        $this->request->validate([
            'object_type'   => 'required|string|max:50|unique:nr_objects,object_type',
            'name'          => 'required|string|max:255',
            'name_en'       => 'nullable|string|max:255',
            'description'   => 'nullable|string|max:500',
            'number_length' => 'required|integer|min:1|max:20',
            'prefix'        => 'nullable|string|max:10',
        ]);

        $object = NrObject::create([
            ...$this->request->only(['object_type', 'name', 'name_en', 'description', 'number_length', 'prefix']),
            'created_by' => $this->request->user()?->id,
        ]);

        return $this->successResponse([
            'id'      => $object->id,
            'message' => 'تم إنشاء كائن الترقيم بنجاح',
        ]);
    }
}
