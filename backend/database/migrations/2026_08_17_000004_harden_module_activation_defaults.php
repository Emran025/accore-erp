<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** @var list<string> */
    private const CONFIGURATION_MODULES = [
        'dashboard',
        'org_structure',
        'settings',
        'users',
        'roles_permissions',
    ];

    public function up(): void
    {
        Schema::table('modules', function ($table): void {
            $table->boolean('is_active')->default(false)->change();
        });

        // Existing live organizations retain their selected operating modules.
        // Only installations with no organizational structure are reset to the
        // safe first-run state, because such a system cannot be operational.
        $hasStructure = DB::table('structure_nodes')
            ->where('status', 'active')
            ->exists();

        if (!$hasStructure) {
            DB::table('modules')->update(['is_active' => false]);
            DB::table('modules')
                ->whereIn('module_key', self::CONFIGURATION_MODULES)
                ->update(['is_active' => true]);
        }
    }

    public function down(): void
    {
        Schema::table('modules', function ($table): void {
            $table->boolean('is_active')->default(true)->change();
        });
    }
};
