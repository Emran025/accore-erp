<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\ExpatManagement;

class ShowExpatRecordAction
{
    public function execute(int|string $id): ExpatManagement
    {
        return ExpatManagement::with(['employee', 'documents'])->findOrFail($id);
    }
}
