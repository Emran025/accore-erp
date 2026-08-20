<?php

namespace Database\Seeders;

use App\Domains\EnterpriseCore\OrganizationGovernance\Models\FactoryCalendar;
use Illuminate\Database\Seeder;

class FactoryCalendarSeeder extends Seeder
{
    public function run(): void
    {
        FactoryCalendar::updateOrCreate(
            ['code' => 'SA-RUH-2026'],
            [
                'name' => 'Saudi Arabia — Riyadh Operations Calendar 2026',
                'name_ar' => 'تقويم عمليات الرياض 2026 — المملكة العربية السعودية',
                'country_code' => 'SA',
                'time_zone' => 'Asia/Riyadh',
                'weekend_days' => ['friday', 'saturday'],
                'is_active' => true,
            ],
        );
    }
}
