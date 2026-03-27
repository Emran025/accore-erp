<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\HumanCapital\WorkforceAdmin\Models\DisciplinaryAction;
class CreateDisciplinaryActionAction
{
    public function execute(int $caseId, array $data): DisciplinaryAction
    {
        $data['case_id'] = $caseId;
        $data['issued_by'] = auth()->id();
        
        return DisciplinaryAction::create($data)->load('employee', 'case');
    }
}
