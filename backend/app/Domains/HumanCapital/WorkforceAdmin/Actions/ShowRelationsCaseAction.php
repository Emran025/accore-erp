<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\HumanCapital\WorkforceAdmin\Models\EmployeeRelationsCase;
class ShowRelationsCaseAction
{
    public function execute(int $id): EmployeeRelationsCase
    {
        $case = EmployeeRelationsCase::with(['employee', 'disciplinaryActions'])->findOrFail($id);
        $user = auth()->user();

        if ($case->confidentiality_level === 'highly_confidential' && $user && !$user->hasRole(['hr_manager', 'admin'])) {
            throw new \Exception('Access denied: Highly confidential case', 403);
        }

        return $case;
    }
}
