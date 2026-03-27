<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Domains\EnterpriseCore\SystemOverview\Models\NrObject;

class NrObjectSeeder extends Seeder
{
    public function run(): void
    {
        $objects = [
            [
                'object_type' => 'employees',
                'name' => 'الموظفين',
                'name_en' => 'Employees',
                'number_length' => 6,
                'prefix' => 'EMP-',
                'is_active' => true,
            ],
            [
                'object_type' => 'ap_suppliers',
                'name' => 'الموردين',
                'name_en' => 'AP Suppliers',
                'number_length' => 6,
                'prefix' => 'SUP-',
                'is_active' => true,
            ],
            [
                'object_type' => 'ar_customers',
                'name' => 'العملاء',
                'name_en' => 'AR Customers',
                'number_length' => 6,
                'prefix' => 'CUST-',
                'is_active' => true,
            ],
            [
                'object_type' => 'vouchers',
                'name' => 'سندات القيد',
                'name_en' => 'Vouchers',
                'number_length' => 8,
                'prefix' => 'JV-',
                'is_active' => true,
            ],
        ];

        foreach ($objects as $obj) {
            NrObject::updateOrCreate(
                ['object_type' => $obj['object_type']],
                $obj
            );
        }
    }
}
