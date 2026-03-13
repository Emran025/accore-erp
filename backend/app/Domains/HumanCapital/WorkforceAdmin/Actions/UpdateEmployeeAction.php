<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Position;
use App\Domains\EnterpriseCore\IAM\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Arr;

class UpdateEmployeeAction
{
    public function execute(int|string $id, array $data): array
    {
        $employee = Employee::findOrFail($id);

        return DB::transaction(function () use ($employee, $data) {
            $updateData = Arr::except($data, ['password']);
            if (!empty($data['password'])) {
                $updateData['password'] = Hash::make($data['password']);
            }

            if (!empty($data['position_id'])) {
                $position = Position::find($data['position_id']);
                if ($position) {
                    $updateData['job_title_id'] = $position->job_title_id;
                    $updateData['role_id'] = $position->role_id;
                    $updateData['department_id'] = $position->department_id;
                }
            }

            $employee->update($updateData);

            if ($employee->user_id) {
                $user = User::find($employee->user_id);
                if ($user) {
                    if (isset($data['full_name'])) $user->full_name = $data['full_name'];
                    if (isset($data['email'])) $user->username = $data['email'];
                    if (isset($updateData['role_id'])) $user->role_id = $updateData['role_id'];
                    if (isset($data['employment_status'])) $user->is_active = $data['employment_status'] === 'active';
                    if (!empty($data['password'])) $user->password = Hash::make($data['password']);

                    if (array_key_exists('manager_id', $data)) {
                        if ($data['manager_id']) {
                            $manager = Employee::find($data['manager_id']);
                            $user->manager_id = $manager ? $manager->user_id : null;
                        } else {
                            $user->manager_id = null;
                        }
                    }

                    $user->save();
                }
            }

            return $employee->toArray();
        });
    }
}
