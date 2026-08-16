<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->json('readiness_requirements')->nullable()->after('is_active');
        });

        $profiles = [
            'sales' => ['requires_org_structure' => true, 'required_node_types' => ['COMP_CODE', 'CONTROLLING_AREA', 'COST_CENTER', 'PROFIT_CENTER', 'PLANT', 'SALES_ORG'], 'requires_operating_context' => true, 'requires_open_fiscal_period' => true, 'requires_chart_of_accounts' => true],
            'inventory' => ['requires_org_structure' => true, 'required_node_types' => ['COMP_CODE', 'PLANT', 'STORAGE_LOC'], 'requires_operating_context' => false, 'requires_open_fiscal_period' => true, 'requires_chart_of_accounts' => true],
            'purchases' => ['requires_org_structure' => true, 'required_node_types' => ['COMP_CODE', 'CONTROLLING_AREA', 'COST_CENTER', 'PROFIT_CENTER', 'PLANT', 'PURCH_ORG'], 'requires_operating_context' => true, 'requires_open_fiscal_period' => true, 'requires_chart_of_accounts' => true],
            'finance' => ['requires_org_structure' => true, 'required_node_types' => ['COMP_CODE', 'CONTROLLING_AREA', 'COST_CENTER', 'PROFIT_CENTER'], 'requires_operating_context' => false, 'requires_open_fiscal_period' => true, 'requires_chart_of_accounts' => true],
            'projects' => ['requires_org_structure' => true, 'required_node_types' => ['COMP_CODE', 'PROFIT_CENTER', 'WBS_ELEMENT'], 'requires_operating_context' => false, 'requires_open_fiscal_period' => true, 'requires_chart_of_accounts' => true],
            'manufacturing' => ['requires_org_structure' => true, 'required_node_types' => ['COMP_CODE', 'PLANT'], 'requires_operating_context' => false, 'requires_open_fiscal_period' => true, 'requires_chart_of_accounts' => true],
            'assets' => ['requires_org_structure' => true, 'required_node_types' => ['COMP_CODE'], 'requires_operating_context' => false, 'requires_open_fiscal_period' => true, 'requires_chart_of_accounts' => true],
            'hr' => ['requires_org_structure' => true, 'required_node_types' => ['COMP_CODE', 'PERSONNEL_AREA', 'HR_ORG_UNIT'], 'requires_operating_context' => false, 'requires_open_fiscal_period' => true, 'requires_chart_of_accounts' => true],
        ];

        DB::table('modules')->orderBy('id')->each(function (object $module) use ($profiles): void {
            $requirements = $profiles[$module->category] ?? ['requires_org_structure' => false, 'required_node_types' => [], 'requires_operating_context' => false, 'requires_open_fiscal_period' => false, 'requires_chart_of_accounts' => false];
            DB::table('modules')->where('id', $module->id)->update([
                'readiness_requirements' => json_encode($requirements, JSON_THROW_ON_ERROR),
            ]);
        });
    }

    public function down(): void
    {
        Schema::table('modules', function (Blueprint $table) {
            $table->dropColumn('readiness_requirements');
        });
    }
};
