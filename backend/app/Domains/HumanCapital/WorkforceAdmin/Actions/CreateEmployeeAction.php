<?php

namespace App\Domains\HumanCapital\WorkforceAdmin\Actions;

use App\Domains\HumanCapital\WorkforceAdmin\Models\Employee;
use App\Domains\HumanCapital\WorkforceAdmin\Models\Position;
use App\Domains\EnterpriseCore\IdentityAccess\Models\User;
use App\Domains\EnterpriseCore\SystemOverview\Services\NumberRangeService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Exception;

class CreateEmployeeAction
{
    public function __construct(
        private readonly NumberRangeService $nrService
    ) {}

    public function execute(array $data): Employee
    {
        return DB::transaction(function () use ($data) {
            $managerUserId = null;
            if (!empty($data['manager_id'])) {
                 $manager = Employee::find($data['manager_id']);
                 $managerUserId = $manager ? $manager->user_id : null;
            }

            $position = Position::findOrFail($data['position_id']);
            $data['job_title_id'] = $position->job_title_id;
            $data['role_id'] = $position->role_id;
            $data['department_id'] = $position->department_id;

            if (empty($data['employee_code']) && !empty($data['nr_object_id']) && !empty($data['nr_group_id'])) {
                $data['employee_code'] = $this->nrService->getNextNumber((int)$data['nr_object_id'], (int)$data['nr_group_id']);
            }

            if (empty($data['employee_code'])) {
                throw new Exception('الرقم الوظيفي مطلوب');
            }

            $user = User::create([
                'username' => $data['email'],
                'password' => Hash::make($data['password']),
                'full_name' => $data['full_name'],
                'role_id' => $position->role_id,
                'is_active' => ($data['employment_status'] ?? 'active') === 'active',
                'manager_id' => $managerUserId,
            ]);

            $data['password'] = Hash::make($data['password']);
            $data['created_by'] = auth()->id();
            $data['user_id'] = $user->id;

            return Employee::create($data);
        });
    }
}
