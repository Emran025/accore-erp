<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;
use App\Domains\EnterpriseCore\IAM\Models\User;
use Illuminate\Support\Facades\DB;

class DeleteEmployeeAction
{
    public function execute(int|string $id): void
    {
        DB::transaction(function () use ($id) {
            $employee = Employee::findOrFail($id);
            if ($employee->user_id) {
                User::where('id', $employee->user_id)->delete();
            }
            $employee->delete();
        });
    }
}
