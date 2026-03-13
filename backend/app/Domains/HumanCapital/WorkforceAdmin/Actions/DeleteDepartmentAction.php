<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\Shared\Actions\Action;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Department;
use Illuminate\Http\JsonResponse;

class DeleteDepartmentAction
{
    public function execute(int $id): void
    {
        Department::destroy($id);
    }
}
