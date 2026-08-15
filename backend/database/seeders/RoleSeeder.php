<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\EnterpriseCore\IdentityAccess\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            ['key' => 'admin', 'ar' => 'مدير النظام', 'en' => 'System Administrator', 'description_ar' => 'صلاحية كاملة على النظام وجميع الأذونات.', 'description_en' => 'Full system access with all permissions.'],
            ['key' => 'manager', 'ar' => 'مدير', 'en' => 'Manager', 'description_ar' => 'مدير أعمال يمتلك معظم الصلاحيات التشغيلية.', 'description_en' => 'Business manager with most operational permissions.'],
            ['key' => 'accountant', 'ar' => 'محاسب', 'en' => 'Accountant', 'description_ar' => 'إدارة العمليات المالية والتقارير.', 'description_en' => 'Financial operations and reporting.'],
            ['key' => 'hr_manager', 'ar' => 'مدير موارد بشرية', 'en' => 'HR Manager', 'description_ar' => 'إدارة شؤون الموارد البشرية والعمليات المرتبطة بها.', 'description_en' => 'Human resources management and administration.'],
            ['key' => 'employee', 'ar' => 'موظف', 'en' => 'Employee', 'description_ar' => 'موظف بصلاحيات الخدمة الذاتية الأساسية.', 'description_en' => 'Standard employee with self-service access.'],
            ['key' => 'cashier', 'ar' => 'كاشير', 'en' => 'Cashier', 'description_ar' => 'صلاحيات عمليات نقطة البيع فقط.', 'description_en' => 'Point-of-sale operations only.'],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['role_key' => $role['key']],
                [
                    'role_name_ar' => $role['ar'],
                    'role_name_en' => $role['en'],
                    'description' => $role['description_ar'],
                    'description_ar' => $role['description_ar'],
                    'description_en' => $role['description_en'],
                    'is_system' => true,
                ],
            );
        }
    }
}
