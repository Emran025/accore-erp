<?php

namespace Database\Seeders;

use App\Domains\Finance\GeneralLedger\Services\StandardChartOfAccountsService;
use Illuminate\Database\Seeder;

class ChartOfAccountsSeeder extends Seeder
{
    public function run(): void
    {
        app(StandardChartOfAccountsService::class)->seedStandardChart();
    }
}
