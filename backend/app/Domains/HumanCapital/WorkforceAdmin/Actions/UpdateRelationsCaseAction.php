<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\HumanCapital\WorkforceAdmin\Models\EmployeeRelationsCase;
class UpdateRelationsCaseAction
{
    public function execute(int $id, array $data): EmployeeRelationsCase
    {
        $case = EmployeeRelationsCase::findOrFail($id);
        
        if (($data['status'] ?? null) === 'resolved' && !$case->resolved_date) {
            $data['resolved_date'] = now();
        }
        
        $case->update($data);
        
        return $case->load('employee', 'disciplinaryActions');
    }
}
