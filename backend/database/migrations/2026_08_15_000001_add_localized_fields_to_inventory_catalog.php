<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table): void {
            $table->string('catalog_code', 100)->nullable()->after('id');
            $table->string('name_ar', 255)->nullable()->after('name');
            $table->string('name_en', 255)->nullable()->after('name_ar');
            $table->text('description_ar')->nullable()->after('name_en');
            $table->text('description_en')->nullable()->after('description_ar');
            $table->unique('catalog_code');
            $table->index('name_ar');
            $table->index('name_en');
        });

        Schema::table('products', function (Blueprint $table): void {
            $table->string('catalog_code', 150)->nullable()->after('id');
            $table->string('name_ar', 255)->nullable()->after('name');
            $table->string('name_en', 255)->nullable()->after('name_ar');
            $table->text('description_ar')->nullable()->after('description');
            $table->text('description_en')->nullable()->after('description_ar');
            $table->string('unit_name_ar', 50)->nullable()->after('unit_name');
            $table->string('unit_name_en', 50)->nullable()->after('unit_name_ar');
            $table->string('sub_unit_name_ar', 50)->nullable()->after('sub_unit_name');
            $table->string('sub_unit_name_en', 50)->nullable()->after('sub_unit_name_ar');
            $table->unique('catalog_code');
            $table->index('name_ar');
            $table->index('name_en');
        });

        // Preserve every existing value as the Arabic source until a domain
        // owner supplies an approved English translation.
        DB::table('categories')->whereNull('name_ar')->update(['name_ar' => DB::raw('name')]);
        DB::table('categories')->whereNull('name_en')->update(['name_en' => DB::raw('name')]);
        DB::table('products')->whereNull('name_ar')->update(['name_ar' => DB::raw('name')]);
        DB::table('products')->whereNull('name_en')->update(['name_en' => DB::raw('name')]);
        DB::table('products')->whereNull('description_ar')->whereNotNull('description')->update(['description_ar' => DB::raw('description')]);
        DB::table('products')->whereNull('description_en')->whereNotNull('description')->update(['description_en' => DB::raw('description')]);
        DB::table('products')->whereNull('unit_name_ar')->update(['unit_name_ar' => DB::raw('unit_name')]);
        DB::table('products')->whereNull('unit_name_en')->update(['unit_name_en' => DB::raw('unit_name')]);
        DB::table('products')->whereNull('sub_unit_name_ar')->whereNotNull('sub_unit_name')->update(['sub_unit_name_ar' => DB::raw('sub_unit_name')]);
        DB::table('products')->whereNull('sub_unit_name_en')->whereNotNull('sub_unit_name')->update(['sub_unit_name_en' => DB::raw('sub_unit_name')]);
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->dropUnique(['catalog_code']);
            $table->dropIndex(['name_ar']);
            $table->dropIndex(['name_en']);
            $table->dropColumn([
                'catalog_code', 'name_ar', 'name_en', 'description_ar', 'description_en',
                'unit_name_ar', 'unit_name_en', 'sub_unit_name_ar', 'sub_unit_name_en',
            ]);
        });

        Schema::table('categories', function (Blueprint $table): void {
            $table->dropUnique(['catalog_code']);
            $table->dropIndex(['name_ar']);
            $table->dropIndex(['name_en']);
            $table->dropColumn(['catalog_code', 'name_ar', 'name_en', 'description_ar', 'description_en']);
        });
    }
};
