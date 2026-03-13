<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\JobTitle;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Position;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;

class DeleteJobTitleAction
{
    public function execute(int|string $id): void
    {
        $title = JobTitle::findOrFail($id);

        if (Position::where('job_title_id', $title->id)->exists()) {
            throw new \Exception('لا يمكن حذف مسمى مرتبط بمناصب وظيفية');
        }

        if (Employee::where('job_title_id', $title->id)->exists()) {
            throw new \Exception('لا يمكن حذف مسمى مرتبط بموظفين');
        }

        $title->delete();
    }
}
