<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\ExpatManagement;

class DeleteExpatRecordAction
{
    public function execute(int|string $id): void
    {
        $expat = ExpatManagement::findOrFail($id);
        $expat->delete();
    }
}
