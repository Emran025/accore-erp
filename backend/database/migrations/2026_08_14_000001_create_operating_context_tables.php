<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('warehouses', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();
            $table->string('name', 255);
            $table->string('name_en', 255)->nullable();
            $table->string('org_node_uuid', 36)->nullable()->index();
            $table->foreignId('cost_center_id')->nullable()->constrained('cost_centers')->nullOnDelete();
            $table->foreignId('profit_center_id')->nullable()->constrained('profit_centers')->nullOnDelete();
            $table->string('status', 20)->default('active')->index();
            $table->boolean('is_active')->default(true)->index();
            $table->text('description')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('pos_terminals', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();
            $table->string('name', 255);
            $table->string('name_en', 255)->nullable();
            $table->string('org_node_uuid', 36)->nullable()->index();
            $table->foreignId('warehouse_id')->constrained('warehouses')->restrictOnDelete();
            $table->foreignId('cost_center_id')->nullable()->constrained('cost_centers')->nullOnDelete();
            $table->foreignId('profit_center_id')->nullable()->constrained('profit_centers')->nullOnDelete();
            $table->string('status', 20)->default('active')->index();
            $table->boolean('is_active')->default(true)->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('operating_contexts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->string('org_node_uuid', 36)->nullable()->index();
            $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
            $table->foreignId('pos_terminal_id')->nullable()->constrained('pos_terminals')->nullOnDelete();
            $table->foreignId('cost_center_id')->nullable()->constrained('cost_centers')->nullOnDelete();
            $table->foreignId('profit_center_id')->nullable()->constrained('profit_centers')->nullOnDelete();
            $table->string('status', 20)->default('draft')->index();
            $table->boolean('is_default')->default(false)->index();
            $table->json('readiness_json')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'is_default'], 'operating_context_user_default_index');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->foreignId('warehouse_id')->nullable()->after('sales_representative_id')->constrained('warehouses')->nullOnDelete();
            $table->foreignId('pos_terminal_id')->nullable()->after('warehouse_id')->constrained('pos_terminals')->nullOnDelete();
            $table->foreignId('cost_center_id')->nullable()->after('pos_terminal_id')->constrained('cost_centers')->nullOnDelete();
            $table->foreignId('profit_center_id')->nullable()->after('cost_center_id')->constrained('profit_centers')->nullOnDelete();
        });

        Schema::table('purchases', function (Blueprint $table) {
            $table->foreignId('warehouse_id')->nullable()->after('supplier_id')->constrained('warehouses')->nullOnDelete();
            $table->foreignId('cost_center_id')->nullable()->after('warehouse_id')->constrained('cost_centers')->nullOnDelete();
            $table->foreignId('profit_center_id')->nullable()->after('cost_center_id')->constrained('profit_centers')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropConstrainedForeignId('profit_center_id');
            $table->dropConstrainedForeignId('cost_center_id');
            $table->dropConstrainedForeignId('warehouse_id');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropConstrainedForeignId('profit_center_id');
            $table->dropConstrainedForeignId('cost_center_id');
            $table->dropConstrainedForeignId('pos_terminal_id');
            $table->dropConstrainedForeignId('warehouse_id');
        });

        Schema::dropIfExists('operating_contexts');
        Schema::dropIfExists('pos_terminals');
        Schema::dropIfExists('warehouses');
    }
};
