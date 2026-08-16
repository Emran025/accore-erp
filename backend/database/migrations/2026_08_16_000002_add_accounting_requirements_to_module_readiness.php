<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('modules')->orderBy('id')->each(function (object $module): void {
            $requirements = json_decode($module->readiness_requirements ?? '{}', true) ?: [];
            $requiresAccounting = in_array($module->category, [
                'sales', 'inventory', 'purchases', 'finance', 'projects', 'manufacturing', 'assets', 'hr',
            ], true);

            $requirements['requires_open_fiscal_period'] = $requirements['requires_open_fiscal_period'] ?? $requiresAccounting;
            $requirements['requires_chart_of_accounts'] = $requirements['requires_chart_of_accounts'] ?? $requiresAccounting;

            DB::table('modules')->where('id', $module->id)->update([
                'readiness_requirements' => json_encode($requirements, JSON_THROW_ON_ERROR),
            ]);
        });
    }

    public function down(): void
    {
        DB::table('modules')->orderBy('id')->each(function (object $module): void {
            $requirements = json_decode($module->readiness_requirements ?? '{}', true) ?: [];
            unset($requirements['requires_open_fiscal_period'], $requirements['requires_chart_of_accounts']);
            DB::table('modules')->where('id', $module->id)->update([
                'readiness_requirements' => json_encode($requirements, JSON_THROW_ON_ERROR),
            ]);
        });
    }
};
