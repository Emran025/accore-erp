<?php
namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;
use App\Domains\HumanCapital\WorkforceAdmin\Models\EmployeeRelationsCase;
class CreateRelationsCaseAction
{
    public function execute(array $data): EmployeeRelationsCase
    {
        $data['case_number'] = 'CASE-' . date('Ymd') . '-' . str_pad(EmployeeRelationsCase::count() + 1, 4, '0', STR_PAD_LEFT);
        $data['status'] = 'open';
        $data['reported_date'] = now();
        $data['reported_by'] = auth()->id();

        return EmployeeRelationsCase::create($data)->load('employee');
    }
}
