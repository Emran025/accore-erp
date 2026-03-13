<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\ExpatManagement;
use Illuminate\Http\JsonResponse;

class ShowExpatRecordAction extends Action
{
    public function __construct(private readonly int $id) {}

    public function __invoke(): JsonResponse
    {
        $expat = ExpatManagement::with(['employee', 'documents'])->findOrFail($this->id);
        return $this->successResponse($expat->toArray());
    }
}
