<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Position;

class UpdatePositionAction
{
    public function execute(int|string $id, array $data): Position
    {
        $position = Position::findOrFail($id);
        $position->update($data);

        return $position->load(['jobTitle', 'role', 'department']);
    }
}
