<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\ExpatManagement;

class UpdateExpatRecordAction
{
    public function execute(int|string $id, array $data): ExpatManagement
    {
        $expat = ExpatManagement::findOrFail($id);
        
        $expat->update($data);
        return $expat->load('employee', 'documents');
    }
}
