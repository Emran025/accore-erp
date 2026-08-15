<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('roles', function (Blueprint $table): void {
            $table->text('description_ar')->nullable()->after('description');
            $table->text('description_en')->nullable()->after('description_ar');
        });

        Schema::table('tax_authorities', function (Blueprint $table): void {
            $table->string('name_ar', 255)->nullable()->after('name');
            $table->string('name_en', 255)->nullable()->after('name_ar');
        });

        Schema::table('tax_types', function (Blueprint $table): void {
            $table->string('name_ar', 255)->nullable()->after('name');
            $table->string('name_en', 255)->nullable()->after('name_ar');
        });

        Schema::table('tax_rates', function (Blueprint $table): void {
            $table->text('description_ar')->nullable()->after('description');
            $table->text('description_en')->nullable()->after('description_ar');
        });

        DB::table('roles')->whereNull('description_ar')->update(['description_ar' => DB::raw('description')]);
        DB::table('roles')->whereNull('description_en')->update(['description_en' => DB::raw('description')]);
        DB::table('tax_authorities')->whereNull('name_ar')->update(['name_ar' => DB::raw('name')]);
        DB::table('tax_authorities')->whereNull('name_en')->update(['name_en' => DB::raw('name')]);
        DB::table('tax_types')->whereNull('name_ar')->update(['name_ar' => DB::raw('name')]);
        DB::table('tax_types')->whereNull('name_en')->update(['name_en' => DB::raw('name')]);
        DB::table('tax_rates')->whereNull('description_ar')->update(['description_ar' => DB::raw('description')]);
        DB::table('tax_rates')->whereNull('description_en')->update(['description_en' => DB::raw('description')]);
    }

    public function down(): void
    {
        Schema::table('tax_rates', function (Blueprint $table): void {
            $table->dropColumn(['description_ar', 'description_en']);
        });
        Schema::table('tax_types', function (Blueprint $table): void {
            $table->dropColumn(['name_ar', 'name_en']);
        });
        Schema::table('tax_authorities', function (Blueprint $table): void {
            $table->dropColumn(['name_ar', 'name_en']);
        });
        Schema::table('roles', function (Blueprint $table): void {
            $table->dropColumn(['description_ar', 'description_en']);
        });
    }
};
