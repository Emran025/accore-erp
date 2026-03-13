<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Position;

class ShowPositionAction
{
    public function execute(int|string $id): array
    {
        $position = Position::with([
            'jobTitle',
            'role.permissions.module',
            'department',
            'employees' => function ($q) {
                $q->where('is_active', true)->select('id', 'full_name', 'employee_code', 'position_id', 'hire_date');
            }
        ])->findOrFail($id);

        return $position->toArray();
    }
}
