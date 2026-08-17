<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('modules')->orderBy('id')->each(function (object $module): void {
            $requirements = json_decode($module->readiness_requirements ?? '[]', true) ?: [];
            if (!($requirements['requires_org_structure'] ?? false)) {
                return;
            }

            $requirements['requires_working_unit'] = true;
            DB::table('modules')->where('id', $module->id)->update([
                'readiness_requirements' => json_encode($requirements, JSON_THROW_ON_ERROR),
            ]);
        });
    }

    public function down(): void
    {
        DB::table('modules')->orderBy('id')->each(function (object $module): void {
            $requirements = json_decode($module->readiness_requirements ?? '[]', true) ?: [];
            if (!array_key_exists('requires_working_unit', $requirements)) {
                return;
            }

            unset($requirements['requires_working_unit']);
            DB::table('modules')->where('id', $module->id)->update([
                'readiness_requirements' => json_encode($requirements, JSON_THROW_ON_ERROR),
            ]);
        });
    }
};
