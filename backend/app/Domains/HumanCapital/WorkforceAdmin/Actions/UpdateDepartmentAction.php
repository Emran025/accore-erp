<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateDepartmentAction
{
    public function execute(int $id, array $data): array
    {
        $department = Department::findOrFail($id);
        $department->update($data);
        return $department->toArray();
    }
}
