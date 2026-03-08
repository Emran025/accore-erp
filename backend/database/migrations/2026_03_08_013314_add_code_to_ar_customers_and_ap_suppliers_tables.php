<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ar_customers', function (Blueprint $table) {
            $table->string('customer_code', 50)->nullable()->unique()->after('id');
        });

        Schema::table('ap_suppliers', function (Blueprint $table) {
            $table->string('supplier_code', 50)->nullable()->unique()->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ar_customers', function (Blueprint $table) {
            $table->dropColumn('customer_code');
        });

        Schema::table('ap_suppliers', function (Blueprint $table) {
            $table->dropColumn('supplier_code');
        });
    }
};
