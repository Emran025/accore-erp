<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Position;

class CreatePositionAction
{
    public function execute(array $data): array
    {
        $data['position_code'] = Position::generateCode();
        $data['created_by'] = auth()->id();

        $position = Position::create($data);

        return $position->load(['jobTitle', 'role', 'department'])->toArray();
    }
}
