<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\ExpatManagement;
use Illuminate\Http\JsonResponse;

class DeleteExpatRecordAction extends Action
{
    public function __construct(private readonly int $id) {}

    public function __invoke(): JsonResponse
    {
        $expat = ExpatManagement::findOrFail($this->id);
        $expat->delete();
        return $this->successResponse(['message' => 'Expat record deleted successfully']);
    }
}
