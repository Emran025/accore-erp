<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShowDepartmentAction
{
    public function execute(int $id): array
    {
        return Department::with('manager')->findOrFail($id)->toArray();
    }
}
