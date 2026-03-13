<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Position;

class DeletePositionAction
{
    public function execute(int|string $id): void
    {
        $position = Position::findOrFail($id);

        if ($position->employees()->where('is_active', true)->exists()) {
            throw new \Exception('Cannot delete position with active employees assigned');
        }

        $position->delete();
    }
}
