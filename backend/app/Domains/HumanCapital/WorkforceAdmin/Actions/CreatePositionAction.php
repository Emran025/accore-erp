<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Position;

class CreatePositionAction
{
    public function execute(array $data): Position
    {
        $data['position_code'] = Position::generateCode();
        $data['created_by'] = auth()->id();

        return Position::create($data)->load(['jobTitle', 'role', 'department']);
    }
}
